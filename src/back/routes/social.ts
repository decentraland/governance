import { MetadataOptions } from 'decentraland-gatsby/dist/entities/Gatsby/types'
import { replaceHelmetMetadata } from 'decentraland-gatsby/dist/entities/Gatsby/utils'
import { handleRaw } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { readOnce } from 'decentraland-gatsby/dist/entities/Route/routes/file'
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env'
import { Request } from 'express'
import { resolve } from 'path'
import isUUID from 'validator/lib/isUUID'

import ProposalModel from '../../entities/Proposal/model'
import { ProposalAttributes } from '../../entities/Proposal/types'
import intl from '../../intl/en.json'

const GOVERNANCE_API = requiredEnv('GOVERNANCE_API')
const DEFAULT_URL = new URL(GOVERNANCE_API)
DEFAULT_URL.pathname = ''
const DEFAULT_INFO: Partial<MetadataOptions> = {
  title: intl.page.proposal_list.title,
  description: intl.page.proposal_list.description,
  url: DEFAULT_URL.toString(),
  'og:type': 'website',
  'og:site_name': 'Decentraland DAO',
  'twitter:site': '@decentraland',
  'twitter:card': 'summary',
  image: 'https://decentraland.org/images/decentraland.png',
}

export default routes((route) => {
  route.get('/proposal/', handleRaw(injectProposalMetadata))
})

async function readFile(req: Request) {
  const path = resolve(process.cwd(), './public', '.' + req.path, './index.html')
  return readOnce(path)
}

export async function injectHomeMetadata(req: Request) {
  const page = await readFile(req)
  return replaceHelmetMetadata(page.toString(), {
    ...DEFAULT_INFO,
    url: DEFAULT_INFO.url! + req.originalUrl.slice(1),
  })
}

export async function injectProposalMetadata(req: Request) {
  const id = req.query.id as string
  const page = await readFile(req)
  if (!isUUID(id || '')) {
    return replaceHelmetMetadata(page.toString(), {
      ...DEFAULT_INFO,
      url: DEFAULT_INFO.url! + req.originalUrl.slice(1),
      title: intl.page[404].title,
      description: intl.page[404].description,
    })
  }

  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id, deleted: false })
  if (!proposal) {
    return replaceHelmetMetadata(page.toString(), {
      ...DEFAULT_INFO,
      url: DEFAULT_INFO.url! + req.originalUrl.slice(1),
      title: intl.page[404].title,
      description: intl.page[404].description,
    })
  }

  return replaceHelmetMetadata(page.toString(), {
    ...DEFAULT_INFO,
    url: DEFAULT_INFO.url! + req.originalUrl.slice(1),
    title: proposal.title,
    description: proposal.description,
  })
}
