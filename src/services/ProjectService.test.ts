import { VestingWithLogs } from '../clients/VestingData'
import { ProjectStatus, VestingStatus } from '../entities/Grant/types'
import ProjectModel, { Project } from '../models/Project'

import { ErrorService } from './ErrorService'
import { ProjectService } from './ProjectService'
import { VestingService } from './VestingService'

const PROJECT_ID = 'cf8e0a4f-de58-4115-a9d8-12c2f09e2e58'
const OLD_VESTING = '0x1111111111111111111111111111111111111111'
const LATEST_VESTING = '0x2222222222222222222222222222222222222222'

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: PROJECT_ID,
    status: ProjectStatus.InProgress,
    vesting_addresses: [OLD_VESTING, LATEST_VESTING],
    ...overrides,
  } as Project
}

describe('ProjectService.getUpdatedProject', () => {
  let getVestingWithLogs: jest.SpyInstance
  let update: jest.SpyInstance
  let report: jest.SpyInstance

  beforeEach(() => {
    getVestingWithLogs = jest.spyOn(VestingService, 'getVestingWithLogs')
    update = jest.spyOn(ProjectModel, 'update').mockResolvedValue({} as never)
    report = jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // Older grants were paid out directly, so there is no vesting contract to read a status from.
  describe('when the project has no vesting address', () => {
    let result: Awaited<ReturnType<typeof ProjectService.getUpdatedProject>>
    const withoutVesting = project({ status: ProjectStatus.Finished, vesting_addresses: [] })

    beforeEach(async () => {
      jest.spyOn(ProjectModel, 'getProject').mockResolvedValue(withoutVesting)
      result = await ProjectService.getUpdatedProject(PROJECT_ID)
    })

    it('should return the project unchanged', () => {
      expect(result).toEqual(withoutVesting)
    })

    it('should not look for a vesting', () => {
      expect(getVestingWithLogs).not.toHaveBeenCalled()
    })

    it('should not write to the database', () => {
      expect(update).not.toHaveBeenCalled()
    })

    it('should not report an error', () => {
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('when the project has vesting addresses', () => {
    let result: Awaited<ReturnType<typeof ProjectService.getUpdatedProject>>
    const vesting = { status: VestingStatus.Finished, start_at: '2023-01-01T00:00:00.000Z' } as VestingWithLogs

    beforeEach(async () => {
      jest.spyOn(ProjectModel, 'getProject').mockResolvedValue(project())
      getVestingWithLogs.mockResolvedValue(vesting)
      result = await ProjectService.getUpdatedProject(PROJECT_ID)
    })

    it('should read the status from the latest one', () => {
      expect(getVestingWithLogs).toHaveBeenCalledWith(LATEST_VESTING, undefined, { includeLogs: false })
    })

    it('should store the status it read', () => {
      expect(update).toHaveBeenCalledWith(
        { status: ProjectStatus.Finished, updated_at: expect.any(Date) },
        { id: PROJECT_ID }
      )
    })

    it('should return the project with that status and its funding', () => {
      expect(result).toMatchObject({
        status: ProjectStatus.Finished,
        funding: { vesting, enacted_at: vesting.start_at },
      })
    })
  })

  describe('when the vesting cannot be read', () => {
    let result: Awaited<ReturnType<typeof ProjectService.getUpdatedProject>>
    const error = new Error('Alchemy is down')

    beforeEach(async () => {
      jest.spyOn(ProjectModel, 'getProject').mockResolvedValue(project())
      getVestingWithLogs.mockRejectedValue(error)
      result = await ProjectService.getUpdatedProject(PROJECT_ID)
    })

    it('should report it', () => {
      expect(report).toHaveBeenCalledWith(
        'Unable to update project status',
        expect.objectContaining({ error, id: PROJECT_ID })
      )
    })

    it('should still return the project as stored', () => {
      expect(result).toEqual(project())
    })
  })
})
