import { Event } from '../../back/models/Event'

export type EventWithAuthor = {
  author: string
  avatar: string
} & Event
