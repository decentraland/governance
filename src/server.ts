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

import { updateGovernanceBudgets } from './entities/Budget/jobs'
import { activateProposals, finishProposal, notifyCliffEndingSoon, publishBids } from './entities/Proposal/jobs'
import { giveAndRevokeLandOwnerBadges, giveTopVoterBadges, runQueuedAirdropJobs } from './jobs/BadgeAirdrop'
import { pingSnapshot } from './jobs/PingSnapshot'
import { withPgAdvisoryLock } from './jobs/jobLocks'
import airdrops from './routes/airdrop'
import badges from './routes/badges'
import bid from './routes/bid'
import budget from './routes/budget'
import coauthor from './routes/coauthor'
import committee from './routes/committee'
import common from './routes/common'
import council from './routes/council'
import debug from './routes/debug'
import events from './routes/events'
import newsletter from './routes/newsletter'
import notification from './routes/notification'
import project from './routes/project'
import proposal from './routes/proposal'
import sitemap from './routes/sitemap'
import snapshot from './routes/snapshot'
import subscription from './routes/subscription'
import proposalSurveyTopics from './routes/surveyTopics'
import update from './routes/update'
import users from './routes/user'
import vestings from './routes/vestings'
import score from './routes/votes'
import webhooks from './routes/webhooks'
import { DiscordService } from './services/discord'
import { assertSubmissionThresholdsConfigured } from './utils/configurationChecks'

const jobs = manager()
// finishProposal reads shared budget/proposal state and fires non-idempotent side effects,
// so it must never overlap itself (a slow run spilling into the next tick) or run on two
// dynos at once — both would double-count budget and duplicate notifications/events. The
// Postgres advisory lock serializes it across every instance. publishBids has the same
// exposure and previously used only the in-process guard, which does nothing across dynos.
jobs.cron('@eachMinute', withPgAdvisoryLock('finishProposal', finishProposal))
jobs.cron('@eachMinute', activateProposals)
jobs.cron('@each5Minute', withPgAdvisoryLock('publishBids', publishBids))
jobs.cron('@each10Second', pingSnapshot)
jobs.cron('30 0 * * *', updateGovernanceBudgets) // Runs at 00:30 daily
jobs.cron('35 0 * * *', notifyCliffEndingSoon) // Runs at 00:35 daily
jobs.cron('30 1 * * *', runQueuedAirdropJobs) // Runs at 01:30 daily
jobs.cron('30 2 * * *', giveAndRevokeLandOwnerBadges) // Runs at 02:30 daily
jobs.cron('30 3 1 * *', giveTopVoterBadges) // Runs at 03:30 on the first day of the month

const file = readFileSync('static/api.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)
swaggerDocument['servers'] = [{ url: process.env.GATSBY_GOVERNANCE_API }]

const app = express()
app.set('x-powered-by', false)
app.use(withLogs())
// Capture the raw request body for webhook routes so signature HMACs are verified against
// the exact bytes the sender signed, not a re-serialization. Registered before the main
// chain; body-parser in withBody() skips re-parsing because req._body is already set.
app.use(
  '/api/webhooks',
  express.json({
    verify: (req, _res, buf) => {
      ;(req as unknown as { rawBody?: string }).rawBody = buf.toString('utf8')
    },
  })
)
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
  council,
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

// Public: crawlers need these documents without authentication. Apply a dedicated limiter
// because the sitemap router is mounted outside the /api middleware chain.
app.use('/governance', withDDosProtection({ limit: 100, checkinterval: 4 }))
app.use(sitemap)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Fail at boot rather than serve with a voting power gate that lets everyone through.
assertSubmissionThresholdsConfigured()

void initializeServices([
  process.env.DATABASE !== 'false' && databaseInitializer(),
  process.env.JOBS !== 'false' && jobInitializer(jobs),
  process.env.HTTP !== 'false' && serverInitializer(app, process.env.PORT || 4000, process.env.HOST),
])

DiscordService.init()
