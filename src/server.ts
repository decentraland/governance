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
import badges from './back/routes/badges'
import bid from './back/routes/bid'
import budget from './back/routes/budget'
import coauthor from './back/routes/coauthor'
import committee from './back/routes/committee'
import common from './back/routes/common'
import debug from './back/routes/debug'
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
import { DiscordService } from './back/services/discord'
import { updateGovernanceBudgets } from './entities/Budget/jobs'
import { activateProposals, finishProposal, publishBids } from './entities/Proposal/jobs'
import filesystem, {
  cpsScriptSrc,
  cspChildSrc,
  cspConnectSrc,
  cspFontSrc,
  cspFormAction,
  cspImageSrc,
  cspManifestSrc,
  cspMediaSrc,
  cspStyleSrc,
} from './utils/filesystem'

import { GOVERNANCE_URL, IS_NEW_ROLLOUT } from './constants'

const jobs = manager()
jobs.cron('@eachMinute', finishProposal)
jobs.cron('@eachMinute', activateProposals)
jobs.cron('@eachMinute', publishBids)
jobs.cron('@each10Second', pingSnapshot)
jobs.cron('@daily', updateGovernanceBudgets)
jobs.cron('@daily', runAirdropJobs)
jobs.cron('@monthly', giveTopVoterBadges)

const file = readFileSync('static/api.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

swaggerDocument['servers'] = [{ url: process.env.GATSBY_GOVERNANCE_API }]

const app = express()
app.set('x-powered-by', false)
app.use(withLogs())
app.use('/api', [
  status(),
  withDDosProtection(),
  withCors(),
  withBody(),
  committee,
  debug,
  users,
  proposal,
  proposalSurveyTopics,
  score,
  subscription,
  update,
  coauthor,
  budget,
  badges,
  common,
  bid,
  snapshot,
  vestings,
  project,
  newsletter,
  notification,
  handle(async () => {
    throw new RequestError('NotFound', RequestError.NotFound)
  }),
])

app.use(metrics([gatsbyRegister, register]))

app.use(sitemap)
app.use(IS_NEW_ROLLOUT ? '/governance/' : '/', social)

// Balance to profile redirect to preserve previous URL
app.get(
  IS_NEW_ROLLOUT ? '/governance/balance' : '/balance',
  handleRaw(async (req, res) => {
    const address = req.query.address
    const addressParam = address ? `?address=${address}` : ''
    return res.redirect(`${GOVERNANCE_URL}/profile/${addressParam}`)
  })
)

// Grants to project redirect to preserve previous URL
app.get(
  IS_NEW_ROLLOUT ? '/governance/grants' : '/grants',
  handleRaw(async (req, res) => {
    return res.redirect(`${GOVERNANCE_URL}/projects`)
  })
)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

console.log('FILESYSTE', filesystem(IS_NEW_ROLLOUT ? 'public-prefix' : 'public', '404.html'))
app.use(
  IS_NEW_ROLLOUT ? '/governance/' : '/',
  withCors({
    cors: '*',
    corsOrigin: '*',
    allowedHeaders: '*',
  }),
  filesystem(IS_NEW_ROLLOUT ? 'public-prefix' : 'public', '404.html', {
    defaultHeaders: {
      'Content-Security-Policy': `base-uri 'self'; child-src ${cspChildSrc}; connect-src ${cspConnectSrc}; default-src 'none'; font-src ${cspFontSrc}; form-action ${cspFormAction}; frame-ancestors 'none'; frame-src https:; img-src ${cspImageSrc}; manifest-src ${cspManifestSrc}; media-src ${cspMediaSrc}; object-src 'none'; style-src ${cspStyleSrc}; worker-src 'self'; script-src ${cpsScriptSrc}`,
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
