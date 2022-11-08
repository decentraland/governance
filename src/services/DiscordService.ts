import { ChannelType, Client, GatewayIntentBits } from 'discord.js'

const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID
const TOKEN = process.env.DISCORD_TOKEN

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

export class DiscordService {
  static init() {
    if (!TOKEN) {
      throw new Error('Discord token missing')
    }

    client.login(TOKEN)
  }

  static async newProposal(title: string, type: string, user: string) {
    if (!CHANNEL_ID) {
      throw new Error('Discord channel ID not set')
    }

    const channel = client.channels.cache.get(CHANNEL_ID)
    if (channel?.type !== ChannelType.GuildText) {
      throw new Error(`Discord channel type is not GuildText ${ChannelType.GuildText}`)
    }

    // TODO: set final message
    channel.send(`New ${type} proposal created: ${title}. By ${user}`)
  }
}
