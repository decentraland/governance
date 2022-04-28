import express from 'express'
import manager from 'decentraland-gatsby/dist/entities/Job/index'
import { jobInitializer } from 'decentraland-gatsby/dist/entities/Job/utils'
import { initializeServices } from 'decentraland-gatsby/dist/entities/Server/handler'
import { serverInitializer } from 'decentraland-gatsby/dist/entities/Server/utils'
import { databaseInitializer } from 'decentraland-gatsby/dist/entities/Database/utils'
import { status, filesystem } from 'decentraland-gatsby/dist/entities/Route/routes'
import { withDDosProtection, withLogs, withCors, withBody } from 'decentraland-gatsby/dist/entities/Route/middleware'
import metricsDatabase from 'decentraland-gatsby/dist/entities/Database/routes'
import metrics from 'decentraland-gatsby/dist/entities/Prometheus/routes'
import handle from 'decentraland-gatsby/dist/entities/Route/handle'
import RequestError from 'decentraland-gatsby/dist/entities/Route/error'
import proposal from './entities/Proposal/routes'
import score from './entities/Votes/routes'
import subscription from './entities/Subscription/routes'
import committee from './entities/Committee/routes'
import social from './entities/Social/routes'
import sitemap from './entities/Sitemap/routes'
import updates from './entities/Updates/routes'
import { activateProposals, finishProposal } from './entities/Proposal/jobs'

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
  proposal,
  score,
  subscription,
  updates,
  handle(async () => {
    throw new RequestError('NotFound', RequestError.NotFound)
  })
])

app.use(metrics)
app.use(metricsDatabase)
app.get('/metrics/*', handle(async () => {
  throw new RequestError('NotFound', RequestError.NotFound)
}))

app.use(sitemap)
app.use('/', social)
app.use(filesystem('public', '404.html'))

initializeServices([
  process.env.DATABASE !== 'false' && databaseInitializer(),
  process.env.JOBS !== 'false' && jobInitializer(jobs),
  process.env.HTTP !== 'false' && serverInitializer(
    app,
    process.env.PORT || 4000,
    process.env.HOST
  )
])
