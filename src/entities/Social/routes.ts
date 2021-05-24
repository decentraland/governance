import { Request } from 'express'
import routes from "decentraland-gatsby/dist/entities/Route/routes";
import { handleRaw } from 'decentraland-gatsby/dist/entities/Route/handle';
import { replaceHelmetMetadata } from "decentraland-gatsby/dist/entities/Gatsby/utils";
import { MetadataOptions } from "decentraland-gatsby/dist/entities/Gatsby/types";
import intl from '../../intl/en.json'
import { readOnce } from 'decentraland-gatsby/dist/entities/Route/routes/file';
import { resolve } from 'path';
import { requiredEnv } from 'decentraland-gatsby/dist/utils/env';
import isUUID from 'validator/lib/isUUID';
import ProposalModel from '../Proposal/model';
import { ProposalAttributes } from '../Proposal/types';

const GOVERNANCE_API = requiredEnv('GOVERNANCE_API')
const DEFAUTL_URL = new URL(GOVERNANCE_API)
DEFAUTL_URL.pathname = ''
const DEFAUTL_INFO: Partial<MetadataOptions> = {
  title: intl.page.proposal_list.title,
  description: intl.page.proposal_list.description,
  url: DEFAUTL_URL.toString(),
  "og:type": 'website',
  "og:site_name": 'Decentraland DAO',
  "twitter:site": '@decentraland',
  "twitter:card": 'summary',
  image: 'https://decentraland.org/images/decentraland.png',
}

export default routes((route) => {
  // route.get('/proposals/:proposal/votes', handleAPI(getProposalVotes))
  // route.get('/proposals/:proposal/vp', withAuth, handleAPI(getMyProposalVotingPower))
  route.get('/', handleRaw(injectHomeMetadata))
  route.get('/en/', handleRaw(injectHomeMetadata))
  route.get('/proposal/', handleRaw(injectProposalMetadata))
  route.get('/en/proposal/', handleRaw(injectProposalMetadata))
})

async function readFile(req: Request) {
  const path = resolve(process.cwd(), './public', '.' + req.path, './index.html')
  return readOnce(path)
}

export async function injectHomeMetadata(req: Request) {
  const page = await readFile(req)
  return replaceHelmetMetadata(page.toString(), {
    ...DEFAUTL_INFO,
    url: DEFAUTL_INFO.url! + req.originalUrl.slice(1)
  })
}

export async function injectProposalMetadata(req: Request) {
  const id = req.query.id as string
  const page = await readFile(req)
  if (!isUUID(id || '')) {
    return replaceHelmetMetadata(page.toString(), {
      ...DEFAUTL_INFO,
      url: DEFAUTL_INFO.url! + req.originalUrl.slice(1),
      title: intl.page[404].title,
      description: intl.page[404].description,
    })
  }

  const proposal = await ProposalModel.findOne<ProposalAttributes>({ id, deleted: false })
  if (!proposal) {
    return replaceHelmetMetadata(page.toString(), {
      ...DEFAUTL_INFO,
      url: DEFAUTL_INFO.url! + req.originalUrl.slice(1),
      title: intl.page[404].title,
      description: intl.page[404].description,
    })
  }

  return replaceHelmetMetadata(page.toString(), {
    ...DEFAUTL_INFO,
    url: DEFAUTL_INFO.url! + req.originalUrl.slice(1),
    title: proposal.title,
    description: proposal.description,
  })
}