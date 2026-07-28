import { ProjectStatus, VestingStatus } from '../../src/entities/Grant/types'
import { ProposalStatus } from '../../src/entities/Proposal/types'
import { UpdateAttributes } from '../../src/entities/Updates/types'
import { VestingService } from '../../src/services/VestingService'
import { UpdateService } from '../../src/services/update'
import { cleanTables, closeTestDb, initTestDb } from '../setup/db'
import { ProjectRow, insertProject, insertProposal, readProjectRow, readProjectUpdates } from '../setup/factories'

// Only the vesting network call is mocked here. ProjectService is deliberately left real: the write
// this guards against lived in ProjectService.getUpdatedProject, so mocking it away would make the
// assertions vacuous — they would pass no matter which project read the computation used.
jest.mock('../../src/services/VestingService', () => ({
  VestingService: {
    getVestingWithLogs: jest.fn(),
  },
}))

const VESTING_ADDRESS = '0x1111111111111111111111111111111111111111'

// A ~3-month vesting, so the computation yields 3 pending updates. The status maps to
// ProjectStatus.Finished, which differs from the stored in_progress: a status refresh on this path
// would therefore be a visible write rather than a no-op.
const VESTING_WITH_LOGS = {
  start_at: '2020-01-01 00:00:00z',
  finish_at: '2020-03-31 00:00:00z',
  status: VestingStatus.Finished,
}

describe('UpdateService.computePendingUpdatesForVesting', () => {
  beforeAll(async () => {
    await initTestDb()
  })

  afterAll(async () => {
    await closeTestDb()
  })

  afterEach(async () => {
    await cleanTables()
    jest.clearAllMocks()
  })

  describe('when computing the pending update schedule for a project', () => {
    let projectId: string
    let projectBefore: ProjectRow | undefined
    let projectAfter: ProjectRow | undefined
    let computed: UpdateAttributes[]

    beforeEach(async () => {
      ;(VestingService.getVestingWithLogs as jest.Mock).mockResolvedValue(VESTING_WITH_LOGS)
      const proposal = await insertProposal(ProposalStatus.Enacted, [VESTING_ADDRESS])
      projectId = await insertProject(proposal.id)
      projectBefore = await readProjectRow(projectId)
      computed = await UpdateService.computePendingUpdatesForVesting(projectId, [VESTING_ADDRESS])
      projectAfter = await readProjectRow(projectId)
    })

    it('should build one pending update per vesting month', () => {
      expect(computed).toHaveLength(3)
    })

    it('should not persist any of the updates it builds', async () => {
      expect(await readProjectUpdates(projectId)).toHaveLength(0)
    })

    it('should not refresh the project status, so a caller that loses a later race writes nothing', () => {
      expect(projectAfter?.status).toBe(ProjectStatus.InProgress)
    })

    it('should leave the project row untouched', () => {
      expect(projectAfter).toEqual(projectBefore)
    })
  })
})
