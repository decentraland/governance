import * as uuid from 'uuid'

import UpdateModel from './model'
import { UpdateStatus } from './types'

jest.mock('uuid')

const NOW = new Date()

const PROPOSAL_ID = '123'
const DURATION = 12
const UUID = '00000000-0000-0000-0000-000000000000'

const VALID_PENDING_UPDATE = {
  id: UUID,
  proposal_id: PROPOSAL_ID,
  status: UpdateStatus.Pending,
  due_date: new Date(new Date().setMonth(NOW.getMonth() + 1)),
  created_at: NOW,
  updated_at: NOW,
}

describe('UpdateModel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(UpdateModel, 'create').mockResolvedValue(VALID_PENDING_UPDATE)
    jest.spyOn(uuid, 'v1').mockReturnValue(UUID)
    jest.useFakeTimers('modern')
    jest.setSystemTime(NOW)
  })
  describe('createPendingUpdates', () => {
    it('creates the expected number of pending updates', async () => {
      await UpdateModel.createPendingUpdates(PROPOSAL_ID, DURATION)
      expect(UpdateModel.create).toHaveBeenCalledTimes(DURATION)
    })

    it('creates pending updates with the correct attributes', async () => {
      await UpdateModel.createPendingUpdates(PROPOSAL_ID, DURATION)
      expect(UpdateModel.create).toHaveBeenCalledWith(VALID_PENDING_UPDATE)
    })
  })
})
