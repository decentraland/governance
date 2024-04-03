import { databaseInitializer } from 'decentraland-gatsby/dist/entities/Database/utils'
import manager from 'decentraland-gatsby/dist/entities/Job/index'
import { jobInitializer } from 'decentraland-gatsby/dist/entities/Job/utils'
import { gatsbyRegister } from 'decentraland-gatsby/dist/entities/Prometheus/metrics'
import metrics from 'decentraland-gatsby/dist/entities/Prometheus/routes/utils'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handle, { handleRaw } from 'decentraland-gatsby/dist/entities/Route/handle'
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
import social from './back/routes/social'
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
import filesystem, {
  cpsScriptSrc,
  cpsWorkerSrc,
  cspChildSrc,
  cspConnectSrc,
  cspFontSrc,
  cspFormAction,
  cspImageSrc,
  cspManifestSrc,
  cspMediaSrc,
  cspStyleSrc,
} from './utils/filesystem'

import { GOVERNANCE_URL } from './constants'

const jobs = manager()
jobs.cron('@eachMinute', finishProposal)
jobs.cron('@eachMinute', activateProposals)
jobs.cron('@eachMinute', publishBids)
jobs.cron('@each10Second', pingSnapshot)
jobs.cron('@daily', updateGovernanceBudgets)
jobs.cron('@daily', runAirdropJobs)
jobs.cron('@monthly', giveTopVoterBadges)
jobs.cron('@daily', EventsService.deleteOldEvents)

const file = readFileSync('static/api.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

const routePrefix = '/governance'

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
app.use(`${routePrefix}/`, social)

// Balance to profile redirect to preserve previous URL
app.get(
  `${routePrefix}/balance`,
  handleRaw(async (req, res) => {
    const address = req.query.address
    const addressParam = address ? `?address=${address}` : ''
    return res.redirect(`${GOVERNANCE_URL}/profile/${addressParam}`)
  })
)

// Grants to project redirect to preserve previous URL
app.get(
  `${routePrefix}/grants`,
  handleRaw(async (req, res) => {
    return res.redirect(`${GOVERNANCE_URL}/projects`)
  })
)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(
  `${routePrefix}/`,
  withCors({
    cors: '*',
    corsOrigin: '*',
    allowedHeaders: '*',
  }),
  filesystem('public', '404.html', {
    defaultHeaders: {
      'Content-Security-Policy': `base-uri 'self'; child-src ${cspChildSrc}; connect-src ${cspConnectSrc}; default-src 'none'; font-src ${cspFontSrc}; form-action ${cspFormAction}; frame-ancestors 'none'; frame-src https:; img-src ${cspImageSrc}; manifest-src ${cspManifestSrc}; media-src ${cspMediaSrc}; object-src 'none'; style-src ${cspStyleSrc}; worker-src ${cpsWorkerSrc}; script-src ${cpsScriptSrc}`,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'strict-transport-security': 'max-age=15552000; includeSubDomains; preload',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'x-xss-protection': '1; mode=block',
      ...(process.env.HEROKU === 'true' && { 'X-Robots-Tag': 'noindex' }),
    },
  })
)

void initializeServices([
  process.env.DATABASE !== 'false' && databaseInitializer(),
  process.env.JOBS !== 'false' && jobInitializer(jobs),
  process.env.HTTP !== 'false' && serverInitializer(app, process.env.PORT || 4000, process.env.HOST),
])

DiscordService.init()
