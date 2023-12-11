import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { EventsService } from '../services/events'

export default routes((route) => {
  route.get('/events', handleAPI(getLatestEvents))
})

async function getLatestEvents() {
  return await EventsService.getLatest()
}
