import type { APIEmbed } from 'discord.js'

import type { ForumTopicAnnouncement } from './discord'

import Discord = require('discord.js')

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  DISCORD_SERVICE_ENABLED: true,
}))

// Set before the require: the service reads the channel id into a module constant at import time.
process.env.DISCORD_CHANNEL_ID = 'governance-channel'

// Imported after the mock so the service picks up the enabled flag.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DiscordService } = require('./discord')

function stubChannel(send: jest.Mock) {
  const channel = { type: Discord.ChannelType.GuildText, send }
  ;(DiscordService as unknown as { client: unknown }).client = {
    channels: { fetch: jest.fn().mockResolvedValue(channel) },
  }
}

function createAnnouncement(overrides: Partial<ForumTopicAnnouncement> = {}): ForumTopicAnnouncement {
  return {
    url: 'https://forum.decentraland.org/t/dao-committee-handover-complete/25456',
    title: 'DAO Committee Handover Complete',
    category: 'DCL Regenesis Labs',
    author: {
      username: 'DCLRegenesisLabs',
      avatarUrl: 'https://forum.decentraland.org/user_avatar/forum.decentraland.org/dclregenesislabs/45/31567_2.png',
      profileUrl: 'https://forum.decentraland.org/u/DCLRegenesisLabs',
    },
    preview: 'The handover of the former DAO Committee multisigs is now complete.',
    ...overrides,
  }
}

function getSentEmbed(send: jest.Mock): APIEmbed {
  return send.mock.calls[0][0].embeds[0].toJSON()
}

describe('DiscordService.newForumTopic', () => {
  let send: jest.Mock

  beforeEach(() => {
    send = jest.fn().mockResolvedValue({ crosspost: jest.fn() })
    stubChannel(send)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when announcing a topic', () => {
    let embed: APIEmbed

    beforeEach(async () => {
      await DiscordService.newForumTopic(createAnnouncement())
      embed = getSentEmbed(send)
    })

    it('should post a single message to the governance channel', () => {
      expect(send).toHaveBeenCalledTimes(1)
    })

    it('should title the message with the topic', () => {
      expect(embed.title).toBe('DAO Committee Handover Complete')
    })

    it('should link to the topic', () => {
      expect(embed.url).toBe('https://forum.decentraland.org/t/dao-committee-handover-complete/25456')
    })

    it('should say which category it was posted in, followed by the preview', () => {
      expect(embed.description).toBe(
        'New topic in **DCL Regenesis Labs**\n\nThe handover of the former DAO Committee multisigs is now complete.'
      )
    })

    it('should credit the forum account that posted it', () => {
      expect(embed.author).toEqual({
        name: 'DCLRegenesisLabs',
        icon_url: 'https://forum.decentraland.org/user_avatar/forum.decentraland.org/dclregenesislabs/45/31567_2.png',
        url: 'https://forum.decentraland.org/u/DCLRegenesisLabs',
      })
    })
  })

  describe('when the first post is longer than the preview allows', () => {
    let description: string | undefined

    beforeEach(async () => {
      const preview = 'word '.repeat(100).trim()
      await DiscordService.newForumTopic(createAnnouncement({ preview }))
      description = getSentEmbed(send).description
    })

    it('should cut it at a word boundary and mark the cut', () => {
      const shown = description?.split('\n\n')[1]
      expect(shown).toBe(`${'word '.repeat(55).trim()}…`)
    })
  })

  describe('when the topic has no text to preview', () => {
    let description: string | undefined

    beforeEach(async () => {
      await DiscordService.newForumTopic(createAnnouncement({ preview: '' }))
      description = getSentEmbed(send).description
    })

    it('should only say which category it was posted in', () => {
      expect(description).toBe('New topic in **DCL Regenesis Labs**')
    })
  })

  // Forum posts are free text written by anyone with an account.
  describe('when the preview contains markdown', () => {
    let description: string | undefined

    beforeEach(async () => {
      await DiscordService.newForumTopic(createAnnouncement({ preview: '**Vote** _now_' }))
      description = getSentEmbed(send).description
    })

    it('should escape it so it cannot reformat the message', () => {
      expect(description?.split('\n\n')[1]).toBe('\\*\\*Vote\\*\\* \\_now\\_')
    })
  })

  describe('when sending to the channel fails', () => {
    let sendError: Error

    beforeEach(() => {
      sendError = new Error('Missing Access')
      send.mockRejectedValueOnce(sendError)
    })

    // The job hands the topic back for a retry only if it learns the post did not go out.
    it('should reject with the failure', async () => {
      await expect(DiscordService.newForumTopic(createAnnouncement())).rejects.toBe(sendError)
    })
  })
})
