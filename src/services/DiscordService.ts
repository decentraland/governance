import profiles from 'decentraland-gatsby/dist/utils/loader/profile'
import { ChannelType, Client, EmbedBuilder, GatewayIntentBits } from 'discord.js'

import { capitalizeFirstLetter } from '../clients/utils'
import { ProposalType } from '../entities/Proposal/types'
import { isGovernanceProcessProposal } from '../entities/Proposal/utils'

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID
const TOKEN = process.env.DISCORD_TOKEN

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

const DEFAULT_AVATAR = 'https://decentraland.org/images/male.png'

type Field = {
  name: string
  value: string
}

enum MessageColors {
  NEW_PROPOSAL = 0x0099ff,
  FINISH_PROPOSAL = 0x8142f5,
  NEW_UPDATE = 0xff0000,
}

type EmbedMessageProps = {
  proposalId: string
  title: string
  proposalType?: ProposalType
  description?: string
  choices: Field[]
  user?: string
  action: string
  color: MessageColors
}

function getChoices(choices: string[]): Field[] {
  return choices.map((choice, idx) => ({
    name: `Option #${idx + 1}`,
    value: capitalizeFirstLetter(choice),
  }))
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
    if (channel?.type !== ChannelType.GuildText) {
      throw new Error(`Discord channel type is not GuildText ${ChannelType.GuildText}`)
    }

    return channel
  }

  private static async formatMessage({
    proposalId,
    title,
    proposalType,
    description,
    choices,
    user,
    action,
    color,
  }: EmbedMessageProps) {
    const fields: Field[] = []

    if (!!proposalType && !!description) {
      let embedDescription = ''

      if (!isGovernanceProcessProposal(proposalType)) {
        embedDescription = description.split('\n')[0]
      } else {
        embedDescription = description.substring(0, 140)
        if (description.length > 140) {
          embedDescription += '...'
        }
      }

      fields.push({
        name: proposalType.toUpperCase().replaceAll('_', ' '),
        value: embedDescription,
      })
    }

    if (choices.length > 0) {
      fields.push({ name: '\u200B', value: '\u200B' }, ...choices)
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setURL(`https://localhost:8000/proposal/?id=${proposalId}`)
      .setDescription(action)
      .setThumbnail('https://decentraland.org/images/decentraland.png')
      .addFields(...fields)
      .setTimestamp()
      .setFooter({ text: 'Decentraland DAO', iconURL: 'https://decentraland.org/images/decentraland.png' })

    if (user) {
      const profile = await profiles.load(user)
      const hasDclProfile = !!profile && !profile.isDefaultProfile
      const profileHasName = hasDclProfile && !!profile.name && profile.name.length > 0
      const displayableUser = profileHasName ? profile.name! : user

      const hasAvatar = !!profile && !!profile.avatar

      embed.setAuthor({
        name: displayableUser,
        iconURL: hasAvatar ? profile.avatar?.snapshots.face256 : DEFAULT_AVATAR,
        url: `https://localhost:8000/profile/?address=${user}`,
      })
    }

    return embed
  }

  static async newProposal(
    proposalId: string,
    title: string,
    type: ProposalType,
    description: string,
    choices: string[],
    user: string
  ) {
    const action = 'A new proposal has been created'
    const embedChoices = getChoices(choices)
    const message = await this.formatMessage({
      proposalId,
      title,
      proposalType: type,
      description,
      choices: embedChoices,
      user,
      action,
      color: MessageColors.NEW_PROPOSAL,
    })
    this.channel.send({ embeds: [message] })
  }

  static async newUpdate(proposalTitle: string, updateId: string, user: string) {
    // TODO: set final message
    this.channel.send(`New update in proposal: ${proposalTitle}, ${updateId}. By ${user}`)
  }

  // TODO: Type outcome
  static async finishProposal(id: string, title: string, outcome: string, winnerChoice?: string) {
    const action = `Proposal has ended with outcome ${outcome}`
    const message = await this.formatMessage({
      proposalId: id,
      title,
      choices: winnerChoice ? [{ name: 'Result', value: capitalizeFirstLetter(winnerChoice) }] : [],
      action,
      color: MessageColors.FINISH_PROPOSAL,
    })
    this.channel.send({ embeds: [message] })
  }
}
