import EventModel from '../models/Event'

export class EventsService {
  static async getLatest() {
    return await EventModel.getLatest()
  }
}
