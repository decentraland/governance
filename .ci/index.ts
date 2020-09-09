import { env, envTLD } from 'dcl-ops-lib/domain'
import { buildStatic } from 'dcl-ops-lib/buildStatic'

async function main() {
  const site = buildStatic({
    domain: `governance.decentraland.${env === 'prd' ? 'org' : envTLD}`,
    defaultPath: 'index.html'
  })

  return {
    cloudfrontDistribution: site.cloudfrontDistribution,
    bucketName: site.contentBucket
  }
}
export = main
