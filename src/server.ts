import metricsDatabase from 'decentraland-gatsby/dist/entities/Database/routes'
import { databaseInitializer } from 'decentraland-gatsby/dist/entities/Database/utils'
import manager from 'decentraland-gatsby/dist/entities/Job/index'
import { jobInitializer } from 'decentraland-gatsby/dist/entities/Job/utils'
import metrics from 'decentraland-gatsby/dist/entities/Prometheus/routes'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import handle from 'decentraland-gatsby/dist/entities/Route/handle'
import { withBody, withCors, withDDosProtection, withLogs } from 'decentraland-gatsby/dist/entities/Route/middleware'
import { filesystem, status } from 'decentraland-gatsby/dist/entities/Route/routes'
import { initializeServices } from 'decentraland-gatsby/dist/entities/Server/handler'
import { serverInitializer } from 'decentraland-gatsby/dist/entities/Server/utils'
import express from 'express'
import path from 'path'

import committee from './entities/Committee/routes'
import debug from './entities/Debug/routes'
import { activateProposals, finishProposal } from './entities/Proposal/jobs'
import proposal from './entities/Proposal/routes'
import sitemap from './entities/Sitemap/routes'
import social from './entities/Social/routes'
import subscription from './entities/Subscription/routes'
import updates from './entities/Updates/routes'
import score from './entities/Votes/routes'

require('newrelic')

const jobs = manager()
jobs.cron('@eachMinute', activateProposals)
jobs.cron('@eachMinute', finishProposal)

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

if (process.env.HEROKU === 'true') {
  app.use(express.static('public'))
  app.use(function (_req, res) {
    res.status(404).sendFile('404/index.html', { root: path.join(__dirname, '../public') })
  })
} else {
  app.use(filesystem('public', '404.html'))
}

void initializeServices([
  process.env.DATABASE !== 'false' && databaseInitializer(),
  process.env.JOBS !== 'false' && jobInitializer(jobs),
  process.env.HTTP !== 'false' && serverInitializer(app, process.env.PORT || 4000, process.env.HOST),
])
