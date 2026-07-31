import type { Client, EmbedBuilder, Snowflake } from 'discord.js'

import { DISCORD_SERVICE_ENABLED } from '../constants'
import { getProfileUrl } from '../entities/Profile/utils'
import { ProposalWithOutcome } from '../entities/Proposal/outcome'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { isGovernanceProcessProposal, proposalUrl } from '../entities/Proposal/utils'
import { getPublicUpdates, getUpdateNumber, getUpdateUrl } from '../entities/Updates/utils'
import { MESSAGE_TIMEOUT_TIME } from '../entities/User/constants'
import UserModel from '../entities/User/model'
import { getEnumDisplayName, inBackground } from '../helpers'
import { ErrorService } from '../services/ErrorService'
import { getProfile } from '../utils/Catalyst'
import { ErrorCategory } from '../utils/errorCategories'
import { isProdEnv } from '../utils/governanceEnvs'

import { UpdateService } from './update'

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID
const PROFILE_VERIFICATION_CHANNEL_ID = process.env.DISCORD_PROFILE_VERIFICATION_CHANNEL_ID || ''
const TOKEN = process.env.DISCORD_TOKEN

import Discord = require('discord.js')

const DCL_LOGO = 'https://decentraland.org/images/decentraland.png'
const DEFAULT_AVATAR = 'https://decentraland.org/images/male.png'
const BLANK = '\u200B'
const PREVIEW_MAX_LENGTH = 140
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
}

type EmbedMessageProps = {
  title: string
  proposalType?: ProposalType
  description?: string
  fields: Field[]
  user?: string
  action?: string
  color: MessageColors
  url?: string
}

function shortenText(text: string, maxLength: number) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + ''
  }
  return text
}

function capitalizeFirstLetter(string: string) {
  return string.length > 0 ? `${string[0].toUpperCase()}${string.slice(1)}` : ''
}

function getChoices(choices: string[]): Field[] {
  return choices.map((choice, idx) => ({
    name: `Option #${idx + 1}`,
    value: capitalizeFirstLetter(choice),
  }))
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

  private static reportError(message: string, error: unknown) {
    if (isProdEnv()) {
      ErrorService.report(message, { error: `${error}`, category: ErrorCategory.Discord })
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

  private static get channel() {
    if (!CHANNEL_ID) {
      throw new Error('Discord channel ID not set')
    }

    const channel = this.client.channels.cache.get(CHANNEL_ID)

    if (!channel) {
      throw new Error(`Discord channel not found: ${CHANNEL_ID}`)
    }

    if (channel?.type !== Discord.ChannelType.GuildText && channel?.type !== Discord.ChannelType.GuildAnnouncement) {
      throw new Error(`Discord channel type is not supported: ${channel?.type}`)
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
    const sentMessage = await this.channel.send({ embeds: messages })
    if (this.channel.type === Discord.ChannelType.GuildAnnouncement) {
      await sentMessage.crosspost()
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
      const action = 'A new proposal has been created'
      const embedChoices = getChoices(choices)
      inBackground(async () => {
        const message = await this.formatMessage({
          url: proposalUrl(proposalId),
          title,
          proposalType: type,
          description,
          fields: embedChoices,
          user,
          action,
          color: MessageColors.NEW_PROPOSAL,
        })
        try {
          await this.sendMessages([message])
          return { action, proposalId }
        } catch (error) {
          throw new Error(`[Error sending message to Discord - New proposal] ID ${proposalId}, Error: ${error}`)
        }
      })
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

          const action = 'A new update has been created'
          const title = `Update #${updateNumber}: ${proposalTitle}`
          const message = await this.formatMessage({
            url: getUpdateUrl(updateId, proposalId),
            title,
            fields: [
              { name: 'Project Health', value: shortenText(health, PREVIEW_MAX_LENGTH) },
              { name: 'Introduction', value: shortenText(introduction, PREVIEW_MAX_LENGTH) },
              { name: 'Highlights', value: shortenText(highlights, PREVIEW_MAX_LENGTH) },
              { name: 'Blockers', value: shortenText(blockers, PREVIEW_MAX_LENGTH) },
              { name: 'Next Steps', value: shortenText(next_steps, PREVIEW_MAX_LENGTH) },
            ],
            user,
            action,
            color: MessageColors.NEW_UPDATE,
          })
          await this.sendMessages([message])
          return { action, updateId }
        } catch (error) {
          throw new Error(`[Error sending message to Discord - New update] ID ${updateId}, Error: ${error}`)
        }
      })
    }
  }

  static finishProposal(id: string, title: string, outcome: ProposalStatus, winnerChoice?: string) {
    if (DISCORD_SERVICE_ENABLED) {
      inBackground(async () => {
        const action = `Proposal has ended with outcome ${getEnumDisplayName(outcome)}`
        const message = await this.formatMessage({
          url: proposalUrl(id),
          title,
          fields: winnerChoice ? [{ name: 'Result', value: capitalizeFirstLetter(winnerChoice) }] : [],
          action,
          color: MessageColors.FINISH_PROPOSAL,
        })
        try {
          await this.sendMessages([message])
          return { action, proposalId: id }
        } catch (error) {
          if (isProdEnv()) {
            ErrorService.report(`Error sending finish proposal message to Discord`, {
              proposalId: id,
              error,
              category: ErrorCategory.Discord,
            })
          }
        }
      })
    }
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
