import handleAPI from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'

import { getProposalSurveyTopics } from './utils'

export default routes((route) => {
  route.get('/proposals/:proposal/survey-topics', handleAPI(getProposalSurveyTopics))
})
