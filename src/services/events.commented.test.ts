import ProposalModel from '../entities/Proposal/model'
import UpdateModel from '../entities/Updates/model'
import UserModel from '../entities/User/model'
import EventModel from '../models/Event'
import { DiscourseWebhookPost } from '../shared/types/discourse'
import logger from '../utils/logger'

import { DiscourseService } from './DiscourseService'
import { ErrorService } from './ErrorService'
import { EventsService } from './events'
import { NotificationService } from './notification'

const PROPOSALS_CATEGORY = 13

function post(overrides: Partial<DiscourseWebhookPost> = {}): DiscourseWebhookPost {
  return {
    id: 987,
    user_id: 42,
    username: 'forum-user',
    created_at: '2026-11-24T10:00:00.000Z',
    raw: 'Something the user wrote',
    cooked: '<p>Something the user wrote</p>',
    topic_id: 555,
    topic_title: 'DAO Townhall Thread',
    post_number: 3,
    category_id: PROPOSALS_CATEGORY,
    ...overrides,
  } as DiscourseWebhookPost
}

describe('EventsService.commented', () => {
  let report: jest.SpyInstance
  let loggerLog: jest.SpyInstance
  let createEvent: jest.SpyInstance

  beforeEach(() => {
    jest.spyOn(DiscourseService, 'getCategory').mockReturnValue(PROPOSALS_CATEGORY)
    jest.spyOn(EventModel, 'isDiscourseEventRegistered').mockResolvedValue(false)
    jest.spyOn(UserModel, 'findOne').mockResolvedValue(undefined as never)
    jest.spyOn(NotificationService, 'newCommentOnProposal').mockImplementation(() => undefined as never)
    createEvent = jest.spyOn(EventModel, 'create').mockImplementation(async (event) => event as never)
    report = jest.spyOn(ErrorService, 'report').mockImplementation(() => undefined)
    loggerLog = jest.spyOn(logger, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // The proposals category also holds townhall threads, reports and community topics.
  describe('when the comment is on a topic that is not a proposal', () => {
    beforeEach(async () => {
      jest.spyOn(ProposalModel, 'findOne').mockResolvedValue(null as never)
      await EventsService.commented('event-1', 'post_created', post())
    })

    it('should not report it as an error', () => {
      expect(report).not.toHaveBeenCalled()
    })

    it('should log it, without what the user wrote', () => {
      expect(loggerLog).toHaveBeenCalledWith('Comment is not on a proposal topic', {
        discourse_event_id: 'event-1',
        topic_id: 555,
      })
    })

    it('should not record an event', () => {
      expect(createEvent).not.toHaveBeenCalled()
    })
  })

  describe('when the comment is on a proposal topic', () => {
    beforeEach(async () => {
      jest
        .spyOn(ProposalModel, 'findOne')
        .mockResolvedValue({ id: 'proposal-1', title: 'A proposal', discourse_topic_id: 555 } as never)
      await EventsService.commented('event-1', 'post_created', post({ topic_title: 'A proposal' }))
    })

    it('should record the comment against the proposal', () => {
      expect(createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event_data: expect.objectContaining({ proposal_id: 'proposal-1', discourse_event_id: 'event-1' }),
        })
      )
    })

    it('should not report anything', () => {
      expect(report).not.toHaveBeenCalled()
    })
  })

  describe('when a comment on a project update has no matching update', () => {
    beforeEach(async () => {
      jest.spyOn(ProposalModel, 'findOne').mockResolvedValue(null as never)
      jest.spyOn(UpdateModel, 'findOne').mockResolvedValue(null as never)
      await EventsService.commented('event-2', 'post_created', post({ topic_title: 'Project X | Update #3' }))
    })

    it('should report it with the post ids, not what the user wrote', () => {
      expect(report).toHaveBeenCalledWith('Unable to find commented update', {
        event_data: {
          discourse_event_id: 'event-2',
          discourse_event: 'post_created',
          post_id: 987,
          topic_id: 555,
          post_number: 3,
        },
        category: expect.any(String),
      })
    })
  })

  describe('when a commented update points at a proposal that no longer exists', () => {
    beforeEach(async () => {
      jest
        .spyOn(UpdateModel, 'findOne')
        .mockResolvedValue({ id: 'update-1', project_id: 'project-1', introduction: 'What the author wrote' } as never)
      jest.spyOn(ProposalModel, 'findOne').mockResolvedValue(null as never)
      await EventsService.commented('event-3', 'post_created', post({ topic_title: 'Project X | Update #3' }))
    })

    it('should report the update and project ids, not the update itself', () => {
      expect(report).toHaveBeenCalledWith(
        'Unable to find proposal for commented update',
        expect.objectContaining({ update_id: 'update-1', project_id: 'project-1' })
      )
      expect(JSON.stringify(report.mock.calls[0][1])).not.toContain('What the author wrote')
    })
  })
})
