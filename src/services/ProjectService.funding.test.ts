import { ProjectStatus, VestingStatus } from '../entities/Grant/types'
import ProjectModel from '../models/Project'

import { ProjectService } from './ProjectService'
import { VestingService } from './VestingService'

const VESTING = {
  address: '0x4240c3eea13548418aea8efc52e4c2e1b2d42f84',
  status: VestingStatus.Finished,
  start_at: '2022-05-01T00:00:00.000Z',
  logs: [],
}

function userProject(vestingAddresses: string[]) {
  return {
    id: 'project-1',
    status: ProjectStatus.InProgress,
    vesting_addresses: vestingAddresses,
    configuration: { size: 120000 },
  }
}

describe('ProjectService.getUserProjects', () => {
  beforeEach(() => {
    jest.spyOn(VestingService, 'getAllVestings').mockResolvedValue([VESTING] as never)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // Vestings come back normalized, so the stored address has to be compared the same way.
  describe.each([
    ['with an uppercase 0X prefix', '0X4240C3EEA13548418AEA8EFC52E4C2E1B2D42F84'],
    ['without the 0x prefix', '4240c3eea13548418aea8efc52e4c2e1b2d42f84'],
  ])('when the stored vesting address is %s', (_, storedAddress) => {
    it('should still match it to its vesting', async () => {
      jest.spyOn(ProjectModel, 'getUserProjects').mockResolvedValue([userProject([storedAddress])] as never)
      const [project] = await ProjectService.getUserProjects('0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7')
      expect(project.funding).toEqual({ enacted_at: VESTING.start_at, vesting: VESTING })
      expect(project.status).toBe(ProjectStatus.Finished)
    })
  })

  describe('when the project has no vesting address', () => {
    it('should keep its stored status and no funding', async () => {
      jest.spyOn(ProjectModel, 'getUserProjects').mockResolvedValue([userProject([])] as never)
      const [project] = await ProjectService.getUserProjects('0x56d0B5eD3D525332F00C9BC938f93598ab16AAA7')
      expect(project.funding).toEqual({})
      expect(project.status).toBe(ProjectStatus.InProgress)
    })
  })
})
