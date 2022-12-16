import profiles from 'decentraland-gatsby/dist/utils/loader/profile'
import { ChannelType, Client, EmbedBuilder, GatewayIntentBits } from 'discord.js'

import { capitalizeFirstLetter } from '../clients/utils'
import { getProfileUrl } from '../entities/Profile/utils'
import { ProposalType } from '../entities/Proposal/types'
import { isGovernanceProcessProposal, proposalUrl } from '../entities/Proposal/utils'
import UpdateModel from '../entities/Updates/model'
import { UpdateAttributes } from '../entities/Updates/types'
import { getPublicUpdates, getUpdateNumber, getUpdateUrl } from '../entities/Updates/utils'
import { inBackground } from '../helpers'

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID
const TOKEN = process.env.DISCORD_TOKEN

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

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
}

type EmbedMessageProps = {
  title: string
  proposalType?: ProposalType
  description?: string
  fields: Field[]
  user?: string
  action: string
  color: MessageColors
  url: string
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
  static init() {
    if (!TOKEN) {
      throw new Error('Discord token missing')
    }

    client.login(TOKEN)
  }

  private static get channel() {
    if (!CHANNEL_ID) {
      throw new Error('Discord channel ID not set')
    }

    const channel = client.channels.cache.get(CHANNEL_ID)
    if (channel?.type !== ChannelType.GuildText && channel?.type !== ChannelType.GuildAnnouncement) {
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
        name: proposalType.toUpperCase().replaceAll('_', ' '),
        value: embedDescription,
      })
    }

    if (choices.length > 0) {
      fields.push({ name: BLANK, value: BLANK }, ...choices)
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setURL(url)
      .setDescription(action)
      .setThumbnail(DCL_LOGO)
      .addFields(...fields)
      .setTimestamp()
      .setFooter({ text: 'Decentraland DAO', iconURL: DCL_LOGO })

    if (user) {
      try {
        const profile = await profiles.load(user)
        const hasDclProfile = !!profile && !profile.isDefaultProfile
        const profileHasName = hasDclProfile && !!profile.name && profile.name.length > 0
        const displayableUser = profileHasName ? profile.name! : user

        const hasAvatar = !!profile && !!profile.avatar

        embed.setAuthor({
          name: displayableUser,
          iconURL: hasAvatar ? profile.avatar?.snapshots.face256 : DEFAULT_AVATAR,
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

  static newProposal(
    proposalId: string,
    title: string,
    type: ProposalType,
    description: string,
    choices: string[],
    user: string
  ) {
    const action = 'A new proposal has been created'
    const embedChoices = getChoices(choices)
    inBackground(async () => {
      const message = await this.formatMessage({
        url: proposalUrl({ id: proposalId }),
        title,
        proposalType: type,
        description,
        fields: embedChoices,
        user,
        action,
        color: MessageColors.NEW_PROPOSAL,
      })
      try {
        this.channel.send({ embeds: [message] })
        return { action, proposalId }
      } catch (error) {
        throw new Error(`[Error sending message to Discord - New proposal] ID ${proposalId}, Error: ${error}`)
      }
    })
  }

  static newUpdate(proposalId: string, proposalTitle: string, updateId: string, user: string) {
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
        this.channel.send({ embeds: [message] })
        return { action, updateId }
      } catch (error) {
        throw new Error(`[Error sending message to Discord - New update] ID ${updateId}, Error: ${error}`)
      }
    })
  }

  static finishProposal(id: string, title: string, outcome: string, winnerChoice?: string) {
    inBackground(async () => {
      const action = `Proposal has ended with outcome ${outcome}`
      const message = await this.formatMessage({
        url: proposalUrl({ id }),
        title,
        fields: winnerChoice ? [{ name: 'Result', value: capitalizeFirstLetter(winnerChoice) }] : [],
        action,
        color: MessageColors.FINISH_PROPOSAL,
      })
      try {
        this.channel.send({ embeds: [message] })
        return { action, proposalId: id }
      } catch (error) {
        throw new Error(`[Error sending message to Discord - Finish proposal] ID ${id}, Error: ${error}`)
      }
    })
  }
}
