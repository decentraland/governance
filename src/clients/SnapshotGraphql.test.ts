import { SnapshotGraphql } from './SnapshotGraphql'
import { StrategyOrder } from './SnapshotTypes'

const VOTER = '0x2ac89522cb415ac333e64f52a1a5693218cebd58'
const PROPOSAL_SNAPSHOT_ID = '0x90e4a1e493f2548bf1ba27a63cd45e0d1c8f36bb1693afc2a72b12574309b59d'

function vpByStrategy(values: Partial<Record<StrategyOrder, number>>) {
  const result = new Array(StrategyOrder.ManaPolygon + 1).fill(0)
  for (const [strategy, value] of Object.entries(values)) {
    result[Number(strategy)] = value
  }
  return result
}

describe('SnapshotGraphql.getVpDistribution', () => {
  const client = new SnapshotGraphql('https://hub.snapshot.org')
  let fetchSpy: jest.SpyInstance

  function mockVpResponse(vp: { vp: number; vp_by_strategy: number[] } | null) {
    fetchSpy = jest.spyOn(client as never, 'fetch').mockResolvedValue({ data: { vp } } as never)
  }

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  describe('when a proposal is given', () => {
    beforeEach(async () => {
      mockVpResponse({ vp: 2000, vp_by_strategy: vpByStrategy({ [StrategyOrder.Land]: 2000 }) })
      await client.getVpDistribution(VOTER, PROPOSAL_SNAPSHOT_ID)
    })

    it('should ask Snapshot for the VP on that proposal', () => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/graphql',
        expect.objectContaining({
          json: expect.objectContaining({
            variables: expect.objectContaining({ voter: VOTER, proposal: PROPOSAL_SNAPSHOT_ID }),
          }),
        })
      )
    })
  })

  describe('when the address has less than 1 VP', () => {
    it('should floor the amounts but still report that it has voting power', async () => {
      mockVpResponse({ vp: 0.4, vp_by_strategy: vpByStrategy({ [StrategyOrder.WrappedMana]: 0.4 }) })

      const distribution = await client.getVpDistribution(VOTER, PROPOSAL_SNAPSHOT_ID)

      expect(distribution).toEqual(expect.objectContaining({ hasVotingPower: true, total: 0, own: 0, wMana: 0 }))
    })
  })

  describe('when the address has no VP at all', () => {
    it('should report that it has no voting power', async () => {
      mockVpResponse({ vp: 0, vp_by_strategy: vpByStrategy({}) })

      const distribution = await client.getVpDistribution(VOTER, PROPOSAL_SNAPSHOT_ID)

      expect(distribution).toEqual(expect.objectContaining({ hasVotingPower: false, total: 0 }))
    })
  })

  describe('when the address only has delegated VP', () => {
    it('should report that it has voting power, all of it delegated', async () => {
      mockVpResponse({ vp: 1500.7, vp_by_strategy: vpByStrategy({ [StrategyOrder.Delegation]: 1500.7 }) })

      const distribution = await client.getVpDistribution(VOTER, PROPOSAL_SNAPSHOT_ID)

      expect(distribution).toEqual(
        expect.objectContaining({ hasVotingPower: true, total: 1500, own: 0, delegated: 1500 })
      )
    })
  })

  describe('when Snapshot returns no VP data', () => {
    it('should throw', async () => {
      mockVpResponse(null)

      await expect(client.getVpDistribution(VOTER, PROPOSAL_SNAPSHOT_ID)).rejects.toThrow(
        'Unable to fetch VP Distribution'
      )
    })
  })
})
