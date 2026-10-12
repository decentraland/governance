import type { APIEmbed } from 'discord.js'

import { SnapshotProposalTally } from '../clients/SnapshotTypes'
import { createTestProposal } from '../entities/Proposal/testHelpers'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../entities/Proposal/types'

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

const FINISH_AT = new Date('2026-10-13T15:00:00.000Z')
const FINISH_AT_UNIX = FINISH_AT.getTime() / 1000

function stubChannel(type: Discord.ChannelType, send: jest.Mock) {
  const channel = { type, send }
  ;(DiscordService as unknown as { client: unknown }).client = {
    channels: { cache: { get: jest.fn().mockReturnValue(channel) } },
  }
}

function createProposal(overrides: Partial<ProposalAttributes> = {}): ProposalAttributes {
  return {
    ...createTestProposal(ProposalType.Poll, ProposalStatus.Active),
    title: 'Fund the community events program',
    finish_at: FINISH_AT,
    required_to_pass: 500000,
    configuration: { choices: ['yes', 'no', 'Invalid question/options'] },
    ...overrides,
  }
}

function getSentEmbed(send: jest.Mock): APIEmbed {
  return send.mock.calls[0][0].embeds[0].toJSON()
}

function getField(embed: APIEmbed, name: string) {
  return embed.fields?.find((field) => field.name === name)?.value
}

describe('DiscordService.votingEndsSoon', () => {
  let send: jest.Mock

  beforeEach(() => {
    send = jest.fn().mockResolvedValue({ crosspost: jest.fn() })
    stubChannel(Discord.ChannelType.GuildText, send)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the proposal has votes', () => {
    let proposal: ProposalAttributes
    let embed: APIEmbed

    beforeEach(async () => {
      proposal = createProposal()
      const tally: SnapshotProposalTally = { scores: [300000, 700000, 0], scores_total: 1000000, votes: 1234 }
      await DiscordService.votingEndsSoon(proposal, tally)
      embed = getSentEmbed(send)
    })

    it('should post a single message to the governance channel', () => {
      expect(send).toHaveBeenCalledTimes(1)
    })

    it('should title the message with the proposal', () => {
      expect(embed.title).toBe('Fund the community events program')
    })

    it('should link to the proposal', () => {
      expect(embed.url).toContain(proposal.id)
    })

    it('should say when voting ends with timestamps discord renders for each reader', () => {
      expect(embed.description).toBe(
        `Voting ends <t:${FINISH_AT_UNIX}:R> (<t:${FINISH_AT_UNIX}:f>). Make sure your vote is in.`
      )
    })

    it('should list the standings from the leading choice down', () => {
      expect(getField(embed, 'Current results')).toBe(
        ['**No**: 70.0% (700,000 VP)', '**Yes**: 30.0% (300,000 VP)', '**Invalid question/options**: 0.0% (0 VP)'].join(
          '\n'
        )
      )
    })

    it('should include the number of votes', () => {
      expect(getField(embed, 'Votes')).toBe('1,234')
    })

    it('should include the voting power required to pass', () => {
      expect(getField(embed, 'Required to pass')).toBe('500,000 VP')
    })
  })

  describe('when nobody has voted yet', () => {
    let embed: APIEmbed

    beforeEach(async () => {
      await DiscordService.votingEndsSoon(createProposal(), { scores: [0, 0, 0], scores_total: 0, votes: 0 })
      embed = getSentEmbed(send)
    })

    // Every choice at 0.0% reads like a rendering bug rather than an empty tally.
    it('should say so instead of listing every choice at zero', () => {
      expect(getField(embed, 'Current results')).toBe('No votes yet')
    })
  })

  describe('when the tally could not be read', () => {
    let embed: APIEmbed

    beforeEach(async () => {
      await DiscordService.votingEndsSoon(createProposal())
      embed = getSentEmbed(send)
    })

    it('should still post the reminder', () => {
      expect(send).toHaveBeenCalledTimes(1)
    })

    it('should leave the standings out', () => {
      expect(getField(embed, 'Current results')).toBeUndefined()
    })

    it('should leave the vote count out', () => {
      expect(getField(embed, 'Votes')).toBeUndefined()
    })
  })

  describe('when the proposal has no voting power threshold', () => {
    let embed: APIEmbed

    beforeEach(async () => {
      await DiscordService.votingEndsSoon(createProposal({ required_to_pass: 0 }))
      embed = getSentEmbed(send)
    })

    it('should leave the threshold out', () => {
      expect(getField(embed, 'Required to pass')).toBeUndefined()
    })
  })

  describe('when a poll has more choices than the standings show', () => {
    let standings: string | undefined

    beforeEach(async () => {
      const choices = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      const scores = [8, 7, 6, 5, 4, 3, 2, 1]
      await DiscordService.votingEndsSoon(createProposal({ configuration: { choices } }), {
        scores,
        scores_total: 36,
        votes: 8,
      })
      standings = getField(getSentEmbed(send), 'Current results')
    })

    it('should show only the leading six', () => {
      expect(standings?.split('\n').slice(0, -1)).toHaveLength(6)
    })

    it('should say how many were left out', () => {
      expect(standings?.split('\n').pop()).toBe('…and 2 more')
    })
  })

  // Poll choices are free text written by the author.
  describe('when a choice contains markdown', () => {
    let standings: string | undefined

    beforeEach(async () => {
      await DiscordService.votingEndsSoon(createProposal({ configuration: { choices: ['**bold** claim', 'no'] } }), {
        scores: [10, 0],
        scores_total: 10,
        votes: 1,
      })
      standings = getField(getSentEmbed(send), 'Current results')
    })

    it('should escape it so it cannot reformat the message', () => {
      expect(standings?.split('\n')[0]).toBe('**\\*\\*bold\\*\\* claim**: 100.0% (10 VP)')
    })
  })

  describe('when sending to the channel fails', () => {
    let sendError: Error

    beforeEach(() => {
      sendError = new Error('Missing Access')
      send.mockRejectedValueOnce(sendError)
    })

    // The job hands the reminder back for a retry only if it learns the post did not go out.
    it('should reject with the failure', async () => {
      await expect(DiscordService.votingEndsSoon(createProposal())).rejects.toBe(sendError)
    })
  })

  describe('when the channel is an announcement channel and the crosspost fails', () => {
    let crosspost: jest.Mock

    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      crosspost = jest.fn().mockRejectedValue(new Error('rate limited'))
      send.mockResolvedValue({ crosspost })
      stubChannel(Discord.ChannelType.GuildAnnouncement, send)
    })

    // The message is already in the channel, so failing here would get it posted twice on retry.
    it('should resolve, since the reminder itself went out', async () => {
      await expect(DiscordService.votingEndsSoon(createProposal())).resolves.toBeUndefined()
    })

    it('should still attempt the crosspost', async () => {
      await DiscordService.votingEndsSoon(createProposal())
      expect(crosspost).toHaveBeenCalledTimes(1)
    })
  })
})
