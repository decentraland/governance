import { databaseInitializer } from 'decentraland-gatsby/dist/entities/Database/utils'
import manager from 'decentraland-gatsby/dist/entities/Job/index'
import { jobInitializer } from 'decentraland-gatsby/dist/entities/Job/utils'
import { gatsbyRegister } from 'decentraland-gatsby/dist/entities/Prometheus/metrics'
import metrics from 'decentraland-gatsby/dist/entities/Prometheus/routes/utils'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handle from 'decentraland-gatsby/dist/entities/Route/handle'
import { withBody, withCors, withDDosProtection, withLogs } from 'decentraland-gatsby/dist/entities/Route/middleware'
import { status } from 'decentraland-gatsby/dist/entities/Route/routes'
import { initializeServices } from 'decentraland-gatsby/dist/entities/Server/handler'
import { serverInitializer } from 'decentraland-gatsby/dist/entities/Server/utils'
import express from 'express'
import { readFileSync } from 'fs'
import { register } from 'prom-client'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yaml'

import { giveTopVoterBadges, runAirdropJobs } from './back/jobs/BadgeAirdrop'
import { pingSnapshot } from './back/jobs/PingSnapshot'
import { withLock } from './back/jobs/jobLocks'
import airdrops from './back/routes/airdrop'
import badges from './back/routes/badges'
import bid from './back/routes/bid'
import budget from './back/routes/budget'
import coauthor from './back/routes/coauthor'
import committee from './back/routes/committee'
import common from './back/routes/common'
import debug from './back/routes/debug'
import events from './back/routes/events'
import newsletter from './back/routes/newsletter'
import notification from './back/routes/notification'
import project from './back/routes/project'
import proposal from './back/routes/proposal'
import sitemap from './back/routes/sitemap'
import snapshot from './back/routes/snapshot'
import subscription from './back/routes/subscription'
import proposalSurveyTopics from './back/routes/surveyTopics'
import update from './back/routes/update'
import users from './back/routes/user'
import vestings from './back/routes/vestings'
import score from './back/routes/votes'
import webhooks from './back/routes/webhooks'
import { DiscordService } from './back/services/discord'
import { EventsService } from './back/services/events'
import { updateGovernanceBudgets } from './entities/Budget/jobs'
import { activateProposals, finishProposal, publishBids } from './entities/Proposal/jobs'

const jobs = manager()
jobs.cron('@eachMinute', finishProposal)
jobs.cron('@eachMinute', activateProposals)
jobs.cron('@each5Minute', withLock('publishBids', publishBids))
jobs.cron('@each10Second', pingSnapshot)
jobs.cron('@daily', updateGovernanceBudgets)
jobs.cron('@daily', runAirdropJobs)
jobs.cron('@monthly', giveTopVoterBadges)
jobs.cron('@daily', EventsService.deleteOldEvents)

const file = readFileSync('static/api.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

swaggerDocument['servers'] = [{ url: process.env.GATSBY_GOVERNANCE_API }]

const app = express()
app.set('x-powered-by', false)
app.use(withLogs())
app.use('/api', [
  status(),
  withDDosProtection({ limit: 1000, checkinterval: 4 }),
  withCors(),
  withBody(),
  airdrops,
  badges,
  budget,
  bid,
  common,
  coauthor,
  committee,
  debug,
  events,
  newsletter,
  notification,
  project,
  proposal,
  proposalSurveyTopics,
  score,
  snapshot,
  users,
  subscription,
  update,
  vestings,
  webhooks,
  handle(async () => {
    throw new RequestError('NotFound', RequestError.NotFound)
  }),
])

app.use(metrics([gatsbyRegister, register]))

app.use(sitemap)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

void initializeServices([
  process.env.DATABASE !== 'false' && databaseInitializer(),
  process.env.JOBS !== 'false' && jobInitializer(jobs),
  process.env.HTTP !== 'false' && serverInitializer(app, process.env.PORT || 4000, process.env.HOST),
])

DiscordService.init()
