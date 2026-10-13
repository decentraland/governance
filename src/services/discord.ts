import type { Client, EmbedBuilder, Snowflake } from 'discord.js'
import orderBy from 'lodash/orderBy'

import { SnapshotProposalTally } from '../clients/SnapshotTypes'
import { DISCORD_SERVICE_ENABLED } from '../constants'
import { getProfileUrl } from '../entities/Profile/utils'
import { ProposalWithOutcome } from '../entities/Proposal/outcome'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { isGovernanceProcessProposal, proposalUrl } from '../entities/Proposal/utils'
import { getPublicUpdates, getUpdateNumber, getUpdateUrl } from '../entities/Updates/utils'
import { MESSAGE_TIMEOUT_TIME } from '../entities/User/constants'
import UserModel from '../entities/User/model'
import { getEnumDisplayName, inBackground } from '../helpers'
import DiscordChannelPostModel, { DiscordChannelPostAttributes } from '../models/DiscordChannelPost'
import { ErrorService } from '../services/ErrorService'
import { getProfile } from '../utils/Catalyst'
import Time from '../utils/date/Time'
import { ErrorCategory } from '../utils/errorCategories'
import { isProdEnv } from '../utils/governanceEnvs'
import logger from '../utils/logger'

import { UpdateService } from './update'

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID
const PROFILE_VERIFICATION_CHANNEL_ID = process.env.DISCORD_PROFILE_VERIFICATION_CHANNEL_ID || ''
const TOKEN = process.env.DISCORD_TOKEN

import Discord = require('discord.js')

const DCL_LOGO = 'https://decentraland.org/images/decentraland.png'
const DEFAULT_AVATAR = 'https://decentraland.org/images/male.png'
const BLANK = '\u200B'
const PREVIEW_MAX_LENGTH = 140
// Six lines of the longest possible standing still fit in the 1024 characters Discord allows a field.
const STANDINGS_MAX_CHOICES = 6
const STANDINGS_CHOICE_MAX_LENGTH = 60
const FORUM_PREVIEW_MAX_LENGTH = 280
// Discord allows 25 fields in a message; a new proposal spends two on its type and the spacer.
const MAX_CHOICE_FIELDS = 23
const CHANNEL_POST_BATCH_SIZE = 10
// Retried after 1, 2, 4 ... minutes, capped at an hour, so the attempts cover an outage of a few hours.
const CHANNEL_POST_MAX_ATTEMPTS = 10
const CHANNEL_POST_MAX_RETRY_DELAY = Time.Hour
// Discord caps one fetch at 100; five pages covers any burst the channel's rate limits allow.
const VERIFICATION_FETCH_PAGE_SIZE = 100
const VERIFICATION_FETCH_MAX_PAGES = 5
// Short enough that a message posted now is still picked up well inside the ten second poll.
const VERIFICATION_FETCH_FAILURE_CACHE_TTL = 3000

type Field = {
  name: string
  value: string
}

enum MessageColors {
  NEW_PROPOSAL = 0x0099ff,
  FINISH_PROPOSAL = 0x8142f5,
  NEW_UPDATE = 0x00ff80,
  NOTIFICATION = 0xf5c63b,
  VOTING_ENDS_SOON = 0xff8c00,
  NEW_FORUM_TOPIC = 0x1abc9c,
}

export type ForumTopicAnnouncement = {
  url: string
  title: string
  category: string
  author: { username: string; avatarUrl: string; profileUrl: string }
  preview: string
}

export type EmbedMessageProps = {
  title: string
  proposalType?: ProposalType
  description?: string
  fields: Field[]
  user?: string
  action?: string
  color: MessageColors
  url?: string
}

// The shape a queued channel post is stored in, rebuilt into an embed when it is sent.
export type ChannelMessage = EmbedMessageProps

function shortenText(text: string, maxLength: number) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...'
  }
  return text
}

function capitalizeFirstLetter(string: string) {
  return string.length > 0 ? `${string[0].toUpperCase()}${string.slice(1)}` : ''
}

// Polls take any number of options, so past the field limit the rest are summed up in a last field
// rather than failing the whole message.
function getChoices(choices: string[]): Field[] {
  const fields = choices.map((choice, idx) => ({
    name: `Option #${idx + 1}`,
    value: capitalizeFirstLetter(choice),
  }))
  if (fields.length <= MAX_CHOICE_FIELDS) {
    return fields
  }

  const shown = fields.slice(0, MAX_CHOICE_FIELDS - 1)
  return [...shown, { name: 'More options', value: `…and ${fields.length - shown.length} more` }]
}

function getRetryDelay(attempts: number) {
  return Math.min(Time.Minute * 2 ** (attempts - 1), CHANNEL_POST_MAX_RETRY_DELAY)
}

// Members who left the server, or who do not accept messages from it, are an expected state rather
// than a fault worth an alert on every notification.
function isUnreachableUserError(error: unknown) {
  return (
    error instanceof Discord.DiscordAPIError &&
    (error.code === Discord.RESTJSONErrorCodes.CannotSendMessagesToThisUser ||
      error.code === Discord.RESTJSONErrorCodes.UnknownUser)
  )
}

// Cuts at a word boundary when there is one reasonably close, and marks the cut.
function truncateAtWord(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text
  }
  const cut = text.slice(0, maxLength - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

function formatVotingPower(votingPower: number) {
  return Math.round(votingPower).toLocaleString('en-US')
}

function formatStandings(choices: string[], { scores, scores_total }: SnapshotProposalTally) {
  if (scores_total <= 0) {
    return 'No votes yet'
  }

  const standings = orderBy(
    choices.map((choice, idx) => ({ choice, votingPower: scores[idx] || 0 })),
    'votingPower',
    'desc'
  )
  const lines = standings.slice(0, STANDINGS_MAX_CHOICES).map(({ choice, votingPower }) => {
    // Poll choices are free text, so markdown in them must not leak into the message.
    const name = Discord.escapeMarkdown(shortenText(capitalizeFirstLetter(choice), STANDINGS_CHOICE_MAX_LENGTH))
    const share = ((votingPower / scores_total) * 100).toFixed(1)
    return `**${name}**: ${share}% (${formatVotingPower(votingPower)} VP)`
  })
  if (standings.length > STANDINGS_MAX_CHOICES) {
    lines.push(`…and ${standings.length - STANDINGS_MAX_CHOICES} more`)
  }

  return lines.join('\n')
}

export class IncompleteDiscordVerificationReadError extends Error {
  constructor() {
    super('Could not read the complete Discord verification message window')
    this.name = 'IncompleteDiscordVerificationReadError'
  }
}

export class DiscordService {
  private static client: Client
  private static verificationMessagesFailureCacheExpiresAt?: number
  private static verificationMessagesRequest?: Promise<Discord.Message<true>[]>

  static init() {
    if (!DISCORD_SERVICE_ENABLED) {
      console.log('Discord service disabled')
      return
    }

    if (!TOKEN) {
      throw new Error('Discord token missing')
    }

    this.client = new Discord.Client({
      intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
      ],
    })
    // 'error' is the client's own failure event. The previous listener was registered for
    // 'unhandledRejection', which discord.js never emits, so nothing here was ever reported.
    this.client.on('error', (error) => {
      this.reportError('Error in Discord client', error)
    })

    // Never leave this rejection unhandled: nothing in the process catches it, so a rejected login
    // (revoked or malformed token) would terminate the whole server rather than disable Discord.
    this.client.login(TOKEN).catch((error) => {
      this.reportError('Discord client login failed', error)
    })
  }

  private static reportError(message: string, error: unknown, context?: Record<string, unknown>) {
    if (isProdEnv()) {
      ErrorService.report(message, { ...context, error: `${error}`, category: ErrorCategory.Discord })
    } else if (context) {
      console.error(message, error, context)
    } else {
      console.error(message, error)
    }
  }

  // channels.cache is only populated for channels the gateway has already delivered, so a cold
  // start or a reconnect turns a cache read into a silent failure. Fetch falls back to the api.
  private static async fetchTextChannel(channelId: string) {
    if (!channelId) {
      throw new Error('Discord channel ID not set')
    }

    const channel = await this.client.channels.fetch(channelId)
    if (!channel) {
      throw new Error(`Discord channel not found: ${channelId}`)
    }
    if (channel.type !== Discord.ChannelType.GuildText) {
      throw new Error(`Discord channel type is not supported: ${channel.type}`)
    }

    return channel
  }

  // Same reason as fetchTextChannel: the cache is empty until the gateway is ready, which leaves a
  // window after every restart where a cache-only lookup fails. The governance channel may also be an
  // announcement channel.
  private static async fetchGovernanceChannel() {
    if (!CHANNEL_ID) {
      throw new Error('Discord channel ID not set')
    }

    const channel = await this.client.channels.fetch(CHANNEL_ID)
    if (!channel) {
      throw new Error(`Discord channel not found: ${CHANNEL_ID}`)
    }
    if (channel.type !== Discord.ChannelType.GuildText && channel.type !== Discord.ChannelType.GuildAnnouncement) {
      throw new Error(`Discord channel type is not supported: ${channel.type}`)
    }

    return channel
  }

  private static async formatMessage({
    title,
    proposalType,
    description,
    fields: choices,
    user,
    action,
    color,
    url,
  }: EmbedMessageProps) {
    const fields: Field[] = []

    if (!!proposalType && !!description) {
      const embedDescription = !isGovernanceProcessProposal(proposalType)
        ? description.split('\n')[0]
        : shortenText(description, PREVIEW_MAX_LENGTH)

      fields.push({
        name: getEnumDisplayName(proposalType),
        value: embedDescription,
      })
    }

    if (choices.length > 0) {
      fields.push({ name: BLANK, value: BLANK }, ...choices)
    }

    const embed = new Discord.EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setURL(!!url && url.length > 0 ? url : null)
      .setDescription(!!action && action.length > 0 ? action : null)
      .setThumbnail(DCL_LOGO)
      .addFields(...fields)
      .setTimestamp()
      .setFooter({ text: 'Decentraland DAO', iconURL: DCL_LOGO })

    if (user) {
      try {
        const profile = await getProfile(user)

        embed.setAuthor({
          name: profile.username || user,
          iconURL: profile.avatarUrl,
          url: getProfileUrl(user),
        })
      } catch (error) {
        console.error(`Error loading profile for user ${user}`, error)
        embed.setAuthor({
          name: user,
          iconURL: DEFAULT_AVATAR,
          url: getProfileUrl(user),
        })
      }
    }

    return embed
  }

  private static async sendMessages(messages: EmbedBuilder[]) {
    const channel = await this.fetchGovernanceChannel()
    const sentMessage = await channel.send({ embeds: messages })
    if (channel.type === Discord.ChannelType.GuildAnnouncement) {
      // The message is already in the channel by now. Failing the send over the crosspost would
      // make a caller that retries on failure post it a second time.
      try {
        await sentMessage.crosspost()
      } catch (error) {
        this.reportError('Error crossposting Discord message', error)
      }
    }
  }

  static newProposal(
    proposalId: string,
    title: string,
    type: ProposalType,
    description: string,
    choices: string[],
    user: string
  ) {
    if (DISCORD_SERVICE_ENABLED) {
      this.queueChannelPost(
        {
          url: proposalUrl(proposalId),
          title,
          proposalType: type,
          description,
          fields: getChoices(choices),
          user,
          action: 'A new proposal has been created',
          color: MessageColors.NEW_PROPOSAL,
        },
        { proposalId }
      )
    }
  }

  static newUpdate(proposalId: string, proposalTitle: string, updateId: string, user: string) {
    if (DISCORD_SERVICE_ENABLED) {
      inBackground(async () => {
        try {
          const publicUpdates = getPublicUpdates(await UpdateService.getAllByProposalId(proposalId))
          const updateNumber = getUpdateNumber(publicUpdates, updateId)
          const updateIdx = publicUpdates.length - updateNumber

          if (isNaN(updateNumber)) {
            throw new Error(`Update with id ${updateId} not found`)
          }

          const { health, introduction, highlights, blockers, next_steps } = publicUpdates[updateIdx]

          if (!health || !introduction || !highlights || !blockers || !next_steps) {
            throw new Error('Missing update fields for Discord message')
          }

          await DiscordChannelPostModel.enqueue({
            url: getUpdateUrl(updateId, proposalId),
            title: `Update #${updateNumber}: ${proposalTitle}`,
            fields: [
              { name: 'Project Health', value: shortenText(health, PREVIEW_MAX_LENGTH) },
              { name: 'Introduction', value: shortenText(introduction, PREVIEW_MAX_LENGTH) },
              { name: 'Highlights', value: shortenText(highlights, PREVIEW_MAX_LENGTH) },
              { name: 'Blockers', value: shortenText(blockers, PREVIEW_MAX_LENGTH) },
              { name: 'Next Steps', value: shortenText(next_steps, PREVIEW_MAX_LENGTH) },
            ],
            user,
            action: 'A new update has been created',
            color: MessageColors.NEW_UPDATE,
          })
          return { updateId }
        } catch (error) {
          this.reportError('Error queueing new update message for Discord', error, { proposalId, updateId })
        }
      })
    }
  }

  static finishProposal(id: string, title: string, outcome: ProposalStatus, winnerChoice?: string) {
    if (DISCORD_SERVICE_ENABLED) {
      this.queueChannelPost(
        {
          url: proposalUrl(id),
          title,
          fields: winnerChoice ? [{ name: 'Result', value: capitalizeFirstLetter(winnerChoice) }] : [],
          action: `Proposal has ended with outcome ${getEnumDisplayName(outcome)}`,
          color: MessageColors.FINISH_PROPOSAL,
        },
        { proposalId: id }
      )
    }
  }

  // Queued rather than sent here, so a post that does not go out is retried by the job sending the
  // queue instead of being lost.
  private static queueChannelPost(message: ChannelMessage, context: Record<string, unknown>) {
    inBackground(async () => {
      try {
        await DiscordChannelPostModel.enqueue(message)
        return context
      } catch (error) {
        this.reportError('Error queueing Discord channel post', error, context)
      }
    })
  }

  // Answers how many went out. A message that cannot be built will not build on a retry either, so
  // it fails at once; a send that fails is retried later with a growing delay.
  static async sendQueuedChannelPosts() {
    const posts = await DiscordChannelPostModel.claimDue(CHANNEL_POST_BATCH_SIZE)
    let sent = 0
    for (const post of posts) {
      if (await this.sendQueuedChannelPost(post)) {
        sent++
      }
    }
    return sent
  }

  private static async sendQueuedChannelPost({ id, message, attempts }: DiscordChannelPostAttributes) {
    // Each post settles on its own: one whose outcome could not be recorded stays in sending, skipped
    // rather than sent twice, and the rest of the batch still goes out.
    try {
      let embed: EmbedBuilder
      try {
        embed = await this.formatMessage(message)
      } catch (error) {
        this.reportError('Error building queued Discord channel post', error, { postId: id })
        await DiscordChannelPostModel.markFailed(id, `${error}`)
        return false
      }

      try {
        await this.sendMessages([embed])
      } catch (error) {
        const gaveUp = attempts >= CHANNEL_POST_MAX_ATTEMPTS
        // The first failure is worth an alert right away; the retries after it would only repeat it.
        if (attempts === 1 || gaveUp) {
          const reason = gaveUp
            ? 'Gave up sending queued Discord channel post'
            : 'Error sending queued Discord channel post'
          this.reportError(reason, error, { postId: id, attempts })
        }
        if (gaveUp) {
          await DiscordChannelPostModel.markFailed(id, `${error}`)
        } else {
          await DiscordChannelPostModel.retryLater(id, `${error}`, new Date(Date.now() + getRetryDelay(attempts)))
        }
        return false
      }

      await DiscordChannelPostModel.markSent(id)
      return true
    } catch (error) {
      this.reportError('Error recording queued Discord channel post outcome', error, { postId: id })
      return false
    }
  }

  // Unlike the other channel posts this one is awaited and throws, so the caller can hand the
  // reminder back for a retry when it does not go out. Without a tally it still goes out, minus the
  // standings: a late reminder is worth more than none.
  static async votingEndsSoon(proposal: ProposalAttributes, tally?: SnapshotProposalTally) {
    const finishAt = new Date(proposal.finish_at)
    const fields: Field[] = []
    if (tally) {
      fields.push(
        { name: 'Current results', value: formatStandings(proposal.configuration.choices || [], tally) },
        { name: 'Votes', value: tally.votes.toLocaleString('en-US') }
      )
    }
    if (proposal.required_to_pass) {
      fields.push({ name: 'Required to pass', value: `${formatVotingPower(proposal.required_to_pass)} VP` })
    }

    // Discord renders these timestamps in each reader's own timezone and keeps the relative one live.
    const endsIn = Discord.time(finishAt, Discord.TimestampStyles.RelativeTime)
    const endsAt = Discord.time(finishAt, Discord.TimestampStyles.ShortDateTime)
    const message = await this.formatMessage({
      url: proposalUrl(proposal.id),
      title: proposal.title,
      fields,
      action: `Voting ends ${endsIn} (${endsAt}). Make sure your vote is in.`,
      color: MessageColors.VOTING_ENDS_SOON,
    })
    await this.sendMessages([message])
  }

  // Awaited and throwing like votingEndsSoon, so the job can hand the topic back when it does not go
  // out. The author is the forum account, which has no catalyst profile to look up.
  static async newForumTopic({ url, title, category, author, preview }: ForumTopicAnnouncement) {
    const description = [`New topic in **${Discord.escapeMarkdown(category)}**`]
    if (preview) {
      // Forum posts are free text, so markdown in them must not leak into the message.
      description.push(Discord.escapeMarkdown(truncateAtWord(preview, FORUM_PREVIEW_MAX_LENGTH), { maskedLink: true }))
    }

    const message = await this.formatMessage({
      url,
      title,
      fields: [],
      action: description.join('\n\n'),
      color: MessageColors.NEW_FORUM_TOPIC,
    })
    message.setAuthor({ name: author.username, iconURL: author.avatarUrl, url: author.profileUrl })
    await this.sendMessages([message])
  }

  static sendDirectMessage(userId: Snowflake, message: Omit<EmbedMessageProps, 'color'>) {
    if (DISCORD_SERVICE_ENABLED) {
      inBackground(async () => {
        try {
          const user = await this.client.users.fetch(userId)
          const dmChannel = await user.createDM()
          const embedMessage = await this.formatMessage({ ...message, color: MessageColors.NOTIFICATION })
          return await dmChannel.send({ embeds: [embedMessage] })
        } catch (error) {
          if (isUnreachableUserError(error)) {
            logger.log('Discord user cannot receive direct messages', { userId })
            return
          }
          if (isProdEnv()) {
            ErrorService.report(`Error sending direct message to user`, {
              userId,
              error: `${error}`,
              category: ErrorCategory.Discord,
            })
          } else {
            console.error(`Error sending direct message to user with ID ${userId}`, error)
          }
        }
      })
    }
  }

  static sendDirectMessages(addresses: string[], message: Omit<EmbedMessageProps, 'color'>) {
    if (DISCORD_SERVICE_ENABLED) {
      inBackground(async () => {
        try {
          const validatedUsers = await UserModel.getActiveDiscordIds(addresses)
          for (const user of validatedUsers) {
            this.sendDirectMessage(user.discord_id, message)
          }
        } catch (error) {
          if (isProdEnv()) {
            ErrorService.report(`Error sending direct messages to users`, {
              addresses,
              error: `${error}`,
              category: ErrorCategory.Discord,
            })
          } else {
            console.error(`Error sending direct messages to users`, error)
          }
        }
      })
    }
  }

  static async getProfileVerificationMessages(): Promise<Discord.Message<true>[]> {
    if (!DISCORD_SERVICE_ENABLED) {
      throw new IncompleteDiscordVerificationReadError()
    }

    if (this.verificationMessagesFailureCacheExpiresAt && this.verificationMessagesFailureCacheExpiresAt > Date.now()) {
      throw new IncompleteDiscordVerificationReadError()
    }

    if (this.verificationMessagesRequest) {
      return await this.verificationMessagesRequest
    }

    const request = this.fetchProfileVerificationMessages()
    this.verificationMessagesRequest = request
    try {
      return await request
    } finally {
      if (this.verificationMessagesRequest === request) {
        this.verificationMessagesRequest = undefined
      }
    }
  }

  private static async fetchProfileVerificationMessages(): Promise<Discord.Message<true>[]> {
    try {
      const channel = await this.fetchTextChannel(PROFILE_VERIFICATION_CHANNEL_ID)

      // Bounded by the validation window, not by a message count: posting after a pending
      // verification message must not push it out of view and hide it from the ambiguity check.
      const oldestRelevantTimestamp = Date.now() - MESSAGE_TIMEOUT_TIME
      const messages: Discord.Message<true>[] = []
      let before: Snowflake | undefined

      // Paged rather than unbounded, so a flooded channel cannot turn one poll into an unbounded
      // number of api calls.
      let readWholeWindow = false
      for (let page = 0; page < VERIFICATION_FETCH_MAX_PAGES; page++) {
        const batch = await channel.messages.fetch({ limit: VERIFICATION_FETCH_PAGE_SIZE, before })
        if (batch.size === 0) {
          readWholeWindow = true
          break
        }

        messages.push(...batch.values())

        // A short page means there is nothing older left to read, so the window is covered even
        // if its oldest message is still inside it.
        if (batch.size < VERIFICATION_FETCH_PAGE_SIZE) {
          readWholeWindow = true
          break
        }

        const oldestInBatch = batch.last()
        if (!oldestInBatch || oldestInBatch.createdTimestamp <= oldestRelevantTimestamp) {
          readWholeWindow = true
          break
        }
        before = oldestInBatch.id
      }

      // Out of pages with the window still not covered. A partial read is taken from the newest
      // end, so it can hold a copy of a verification message while hiding the older original it
      // was copied from — exactly what the ambiguity check needs to see. Surface a retryable
      // incomplete-source failure rather than returning a subset. The refusal is cached so a
      // channel kept above the budget does not make every poll spend the whole page budget again.
      if (!readWholeWindow) {
        this.reportError(
          'Verification channel window did not fit the fetch budget',
          new Error(`more than ${VERIFICATION_FETCH_PAGE_SIZE * VERIFICATION_FETCH_MAX_PAGES} messages in the window`)
        )
        this.verificationMessagesFailureCacheExpiresAt = Date.now() + VERIFICATION_FETCH_FAILURE_CACHE_TTL
        throw new IncompleteDiscordVerificationReadError()
      }

      const relevant = messages.filter(
        (message) => !message.author.bot && message.createdTimestamp > oldestRelevantTimestamp
      )
      return relevant
    } catch (error) {
      if (error instanceof IncompleteDiscordVerificationReadError) {
        throw error
      }
      this.reportError('Error getting profile verification messages', error)
      this.verificationMessagesFailureCacheExpiresAt = Date.now() + VERIFICATION_FETCH_FAILURE_CACHE_TTL
      throw new IncompleteDiscordVerificationReadError()
    }
  }

  static async deleteVerificationMessage(messageId: string) {
    if (DISCORD_SERVICE_ENABLED) {
      try {
        const channel = await this.fetchTextChannel(PROFILE_VERIFICATION_CHANNEL_ID)
        // A channel mutation can bring a previously oversized window back inside the read budget,
        // so allow the next validation attempt to retry immediately.
        this.verificationMessagesFailureCacheExpiresAt = undefined
        await channel.messages.delete(messageId)
      } catch (error) {
        this.reportError('Error deleting profile verification message', error)
      }
    }
  }

  static notifyFinishedProposals(proposalsWithOutcome: ProposalWithOutcome[]) {
    for (const { id, title, winnerChoice, newStatus } of proposalsWithOutcome) {
      if (newStatus) {
        this.finishProposal(id, title, newStatus, newStatus === ProposalStatus.Finished ? winnerChoice : undefined)
      }
    }
  }
}
