import type { Client, EmbedBuilder, Snowflake } from 'discord.js'

import { DISCORD_SERVICE_ENABLED } from '../../constants'
import { getProfileUrl } from '../../entities/Profile/utils'
import { ProposalWithOutcome } from '../../entities/Proposal/outcome'
import { ProposalStatus, ProposalType } from '../../entities/Proposal/types'
import { isGovernanceProcessProposal, proposalUrl } from '../../entities/Proposal/utils'
import UpdateModel from '../../entities/Updates/model'
import { UpdateAttributes } from '../../entities/Updates/types'
import { getPublicUpdates, getUpdateNumber, getUpdateUrl } from '../../entities/Updates/utils'
import { capitalizeFirstLetter, getEnumDisplayName, inBackground } from '../../helpers'
import { ErrorService } from '../../services/ErrorService'
import { getProfile } from '../../utils/Catalyst'
import { ErrorCategory } from '../../utils/errorCategories'
import { isProdEnv } from '../../utils/governanceEnvs'

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID
const PROFILE_VERIFICATION_CHANNEL_ID = process.env.DISCORD_PROFILE_VERIFICATION_CHANNEL_ID || ''
const TOKEN = process.env.DISCORD_TOKEN

import Discord = require('discord.js')

const DCL_LOGO = 'https://decentraland.org/images/decentraland.png'
const DEFAULT_AVATAR = 'https://decentraland.org/images/male.png'
const BLANK = '\u200B'
const PREVIEW_MAX_LENGTH = 140

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

function getChoices(choices: string[]): Field[] {
  return choices.map((choice, idx) => ({
    name: `Option #${idx + 1}`,
    value: capitalizeFirstLetter(choice),
  }))
}

function getPreviewText(text: string) {
  return text.length > PREVIEW_MAX_LENGTH ? text.slice(0, PREVIEW_MAX_LENGTH) + '...' : text
}

export class DiscordService {
  private static client: Client
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
    this.client.on('unhandledRejection', (error) => {
      if (isProdEnv()) {
        ErrorService.report('Unhandled rejection in Discord client', {
          error,
          category: ErrorCategory.Discord,
        })
      } else {
        console.error('Unhandled rejection in Discord client', error)
      }
    })
    this.client.login(TOKEN)
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
        : getPreviewText(description)

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
          iconURL: profile.avatar,
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
          const publicUpdates = getPublicUpdates(await UpdateModel.find<UpdateAttributes>({ proposal_id: proposalId }))
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
              { name: 'Project Health', value: getPreviewText(health) },
              { name: 'Introduction', value: getPreviewText(introduction) },
              { name: 'Highlights', value: getPreviewText(highlights) },
              { name: 'Blockers', value: getPreviewText(blockers) },
              { name: 'Next Steps', value: getPreviewText(next_steps) },
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
              error,
              category: ErrorCategory.Discord,
            })
          } else {
            console.error(`Error sending direct message to user with ID ${userId}`, error)
          }
        }
      })
    }
  }

  static async getProfileVerificationMessages() {
    if (DISCORD_SERVICE_ENABLED) {
      try {
        const channel = this.client.channels.cache.get(PROFILE_VERIFICATION_CHANNEL_ID)
        if (!channel) {
          throw new Error(`Discord channel not found: ${PROFILE_VERIFICATION_CHANNEL_ID}`)
        }
        if (channel?.type !== Discord.ChannelType.GuildText) {
          throw new Error(`Discord channel type is not supported: ${channel?.type}`)
        }
        const messages = (await channel.messages.fetch({ limit: 10 })).filter((message) => !message.author.bot)
        return messages.map((message) => message)
      } catch (error) {
        if (isProdEnv()) {
          ErrorService.report('Error getting profile verification messages', {
            error,
            category: ErrorCategory.Discord,
          })
        } else {
          console.error('Error getting profile verification message', error)
        }
      }
    }
    return []
  }

  static async deleteVerificationMessage(messageId: string) {
    if (DISCORD_SERVICE_ENABLED) {
      try {
        const channel = this.client.channels.cache.get(PROFILE_VERIFICATION_CHANNEL_ID)
        if (!channel) {
          throw new Error(`Discord channel not found: ${PROFILE_VERIFICATION_CHANNEL_ID}`)
        }
        if (channel?.type !== Discord.ChannelType.GuildText) {
          throw new Error(`Discord channel type is not supported: ${channel?.type}`)
        }
        await channel.messages.delete(messageId)
      } catch (error) {
        if (isProdEnv()) {
          ErrorService.report('Error deleting profile verification message', {
            error,
            category: ErrorCategory.Discord,
          })
        } else {
          console.error('Error deleting profile verification message', error)
        }
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
