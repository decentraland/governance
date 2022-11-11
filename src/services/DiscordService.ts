import profiles from 'decentraland-gatsby/dist/utils/loader/profile'
import { ChannelType, Client, EmbedBuilder, GatewayIntentBits } from 'discord.js'

import { ProposalType } from '../entities/Proposal/types'

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID
const TOKEN = process.env.DISCORD_TOKEN

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

const DEFAULT_AVATAR = 'https://decentraland.org/images/male.png'

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

  private static async formatMessage(
    proposalId: string,
    title: string,
    proposalType: ProposalType,
    description: string,
    choices: string[],
    user: string
  ) {
    const profile = await profiles.load(user)
    const hasDclProfile = !!profile && !profile.isDefaultProfile
    const profileHasName = hasDclProfile && !!profile.name && profile.name.length > 0
    const displayableUser = profileHasName ? profile.name! : user

    const hasAvatar = !!profile && !!profile.avatar

    const embedChoices = choices.map((choice, idx) => ({
      name: `Option #${idx + 1}`,
      value: `${choice[0].toUpperCase()}${choice.slice(1)}`,
    }))

    let embedDescription = ''

    if (proposalType !== ProposalType.Poll) {
      embedDescription = description.split('\n')[0]
    } else {
      embedDescription = description.substring(0, 140)
      if (description.length > 140) {
        embedDescription += '...'
      }
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(title)
      .setURL(`https://localhost:8000/proposal/?id=${proposalId}`)
      .setAuthor({
        name: displayableUser,
        iconURL: hasAvatar ? profile.avatar?.snapshots.face256 : DEFAULT_AVATAR,
        url: `https://localhost:8000/profile/?address=${user}`,
      })
      .setDescription('A new proposal has been created')
      .setThumbnail('https://decentraland.org/images/decentraland.png')
      .addFields(
        {
          name: proposalType.toUpperCase().replaceAll('_', ' '),
          value: embedDescription,
        },
        { name: '\u200B', value: '\u200B' },
        ...embedChoices
      )
      .setTimestamp()
      .setFooter({ text: 'Decentraland DAO', iconURL: 'https://decentraland.org/images/decentraland.png' })

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
    // TODO: set final message
    const message = await this.formatMessage(proposalId, title, type, description, choices, user)
    this.channel.send({ embeds: [message] })
  }

  static async newUpdate(proposalTitle: string, updateId: string, user: string) {
    // TODO: set final message
    this.channel.send(`New update in proposal: ${proposalTitle}, ${updateId}. By ${user}`)
  }

  // TODO: Type outcome
  static async finishProposal(id: string, title: string, outcome: string) {
    // TODO: set final message
    this.channel.send(`Proposal ${id} ${title} has ended with outcome ${outcome}`)
  }
}
