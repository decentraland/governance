import metricsDatabase from 'decentraland-gatsby/dist/entities/Database/routes'
import { databaseInitializer } from 'decentraland-gatsby/dist/entities/Database/utils'
import manager from 'decentraland-gatsby/dist/entities/Job/index'
import { jobInitializer } from 'decentraland-gatsby/dist/entities/Job/utils'
import metrics from 'decentraland-gatsby/dist/entities/Prometheus/routes'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handle, { handleRaw } from 'decentraland-gatsby/dist/entities/Route/handle'
import { withBody, withCors, withDDosProtection, withLogs } from 'decentraland-gatsby/dist/entities/Route/middleware'
import { status } from 'decentraland-gatsby/dist/entities/Route/routes'
import { initializeServices } from 'decentraland-gatsby/dist/entities/Server/handler'
import { serverInitializer } from 'decentraland-gatsby/dist/entities/Server/utils'
import express from 'express'

import { updateGovernanceBudgets } from './entities/Budget/jobs'
import budget from './entities/Budget/routes'
import coauthor from './entities/Coauthor/routes'
import committee from './entities/Committee/routes'
import debug from './entities/Debug/routes'
import { activateProposals, finishProposal } from './entities/Proposal/jobs'
import proposal from './entities/Proposal/routes'
import sitemap from './entities/Sitemap/routes'
import social from './entities/Social/routes'
import subscription from './entities/Subscription/routes'
import updates from './entities/Updates/routes'
import score from './entities/Votes/routes'
import filesystem from './modules/filesystem'
import { DiscordService } from './services/DiscordService'

const jobs = manager()
jobs.cron('@eachMinute', activateProposals)
jobs.cron('@eachMinute', finishProposal)
jobs.cron('@daily', updateGovernanceBudgets)

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
  proposal,
  score,
  subscription,
  updates,
  coauthor,
  budget,
  handle(async () => {
    throw new RequestError('NotFound', RequestError.NotFound)
  }),
])

app.use(metrics)
app.use(metricsDatabase)
app.get(
  '/metrics/*',
  handle(async () => {
    throw new RequestError('NotFound', RequestError.NotFound)
  })
)

app.use(sitemap)
app.use('/', social)

// Balance to profile redirect to preserve previous URL
app.get(
  '/balance',
  handleRaw(async (req, res) => {
    const address = req.query.address
    const websiteUrl = process.env.GATSBY_GOVERNANCE_API?.replace('/api', '')
    const addressParam = address ? `?address=${address}` : ''
    return res.redirect(`${websiteUrl}/profile/${addressParam}`)
  })
)

app.use(
  filesystem('public', '404.html', {
    defaultHeaders: {
      'Content-Security-Policy': `base-uri 'self'; child-src https:; connect-src https: wss:; default-src 'none'; font-src https: data:; form-action 'self'; frame-ancestors 'none'; frame-src https:; img-src https: data:; manifest-src 'self'; media-src 'self'; object-src 'none'; prefetch-src https: data:; style-src 'unsafe-inline' https: data:; worker-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://decentraland.org https://*.decentraland.org https://cdn.segment.com https://cdn.rollbar.com https://ajax.cloudflare.com https://googleads.g.doubleclick.net https://ssl.google-analytics.com https://tagmanager.google.com https://www.google-analytics.com https://www.google-analytics.com https://www.google.com https://www.googleadservices.com https://www.googletagmanager.com`,
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
