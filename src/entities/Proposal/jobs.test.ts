import JobContext from 'decentraland-gatsby/dist/entities/Job/context'

import { DiscordService } from '../../services/DiscordService'

import * as calculateOutcome from './calculateOutcome'
import { ProposalOutcome } from './calculateOutcome'
import { finishProposal } from './jobs'
import ProposalModel from './model'
import * as routes from './routes'
import { createTestProposal } from './test_helpers'
import { ProposalAttributes, ProposalStatus, ProposalType } from './types'

const REJECTED_OUTCOME = {
  winnerChoice: 'no',
  outcomeStatus: ProposalOutcome.REJECTED,
}

const REJECTED_PROPOSAL: ProposalAttributes<any> = createTestProposal(ProposalType.Grant, ProposalStatus.Active)

// eslint-disable-next-line @typescript-eslint/ban-types
interface CustomJobContext extends JobContext<{}> {
  log: jest.Mock<any, any>
  error: jest.Mock<any, any>
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const mockJobContext: CustomJobContext = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  schedule(name: string | null, date: Date, payload: Record<string, any> | undefined): Promise<void> {
    return Promise.resolve(undefined)
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updatePayload(payload: Record<string, any> | undefined): Promise<void> {
    return Promise.resolve(undefined)
  },
  log: jest.fn(),
  error: jest.fn(),
  id: 'some-id',
  handler: null,
  payload: {},
}

jest.mock('../../constants', () => ({
  DISCORD_SERVICE_ENABLED: false,
}))

describe('finishProposals', () => {
  beforeAll(() => {
    jest.spyOn(ProposalModel, 'finishProposal')
    jest.spyOn(routes, 'commentProposalUpdateInDiscourse').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'init').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'finishProposal').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'newProposal').mockImplementation(() => {})
    jest.spyOn(DiscordService, 'newUpdate').mockImplementation(() => {})
  })
  describe('when there is a proposal with rejected outcome', () => {
    beforeEach(() => {
      jest.spyOn(ProposalModel, 'getFinishedProposals').mockResolvedValue([REJECTED_PROPOSAL])
      jest.spyOn(calculateOutcome, 'calculateOutcome').mockResolvedValue(REJECTED_OUTCOME)
    })
    it('finishes the proposal as rejected', async () => {
      await finishProposal(mockJobContext)
      expect(ProposalModel.finishProposal).toHaveBeenCalledWith([REJECTED_PROPOSAL.id], ProposalStatus.Rejected)
    })
  })
})
