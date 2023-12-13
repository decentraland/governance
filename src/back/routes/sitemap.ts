import { handleRaw } from 'decentraland-gatsby/dist/entities/Route/handle'
import routes from 'decentraland-gatsby/dist/entities/Route/routes'
import { Request } from 'express'

import { IS_NEW_ROLLOUT } from '../../constants'
import ProposalModel from '../../entities/Proposal/model'
import { SITEMAP_ITEMS_PER_PAGE, governanceUrl, proposalUrl } from '../../entities/Proposal/utils'

export default routes((router) => {
  const routePrefix = IS_NEW_ROLLOUT ? '/governance' : ''
  router.get(`${routePrefix}/sitemap.xml`, handleRaw(getIndexSitemap, 'application/xml'))
  router.get(`${routePrefix}/sitemap.static.xml`, handleRaw(getStaticSitemap, 'application/xml'))
  router.get(`${routePrefix}/sitemap.proposals.xml`, handleRaw(getProposalsSitemap, 'application/xml'))
})

export async function getIndexSitemap() {
  const proposals = await ProposalModel.countAll()
  const pages = Math.ceil(proposals / SITEMAP_ITEMS_PER_PAGE)

  return [
    `<?xml version="1.0" encoding="UTF-8"?>` + `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    `<sitemap><loc>${governanceUrl('/sitemap.static.xml')}</loc></sitemap>`,
    ...Array.from(
      Array(pages),
      (_, i) => `<sitemap><loc>${governanceUrl(`/sitemap.proposals.xml`)}?page=${i}</loc></sitemap>`
    ),
    '</sitemapindex>',
  ].join('')
}

export async function getStaticSitemap() {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>` + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `<url><loc>${governanceUrl('/')}</loc></url>`,
    `<url><loc>${governanceUrl('/?view=enacted')}</loc></url>`,
    `<url><loc>${governanceUrl('/profile/')}</loc></url>`,
    `<url><loc>${governanceUrl('/activity/')}</loc></url>`,
    `<url><loc>${governanceUrl('/transparency/')}</loc></url>`,
    `<url><loc>${governanceUrl('/submit/')}</loc></url>`,
    `<url><loc>${governanceUrl(`/submit/ban-name/`)}</loc></url>`,
    `<url><loc>${governanceUrl(`/submit/catalyst/`)}</loc></url>`,
    `<url><loc>${governanceUrl(`/submit/grant/`)}</loc></url>`,
    `<url><loc>${governanceUrl(`/submit/poi/?request=add_poi`)}</loc></url>`,
    `<url><loc>${governanceUrl(`/submit/poi/?request=remove_poi`)}</loc></url>`,
    `<url><loc>${governanceUrl(`/submit/poll/`)}</loc></url>`,
    '</urlset>',
  ].join('')
}

export async function getProposalsSitemap(req: Request) {
  const page = Number(req.query.page)
  if (!Number.isFinite(page) || String(page | 0) !== req.query.page) {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '</urlset>',
    ].join('')
  }

  const proposals = await ProposalModel.getSitemapProposals(page)
  return [
    `<?xml version="1.0" encoding="UTF-8"?>` + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...proposals.map((proposal) => `<url><loc>${proposalUrl(proposal.id)}</loc></url>`),
    '</urlset>',
  ].join('')
}
