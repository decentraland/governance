// import { resolve } from "path";
import {env} from "dcl-ops-lib/domain";
import { buildGatsby } from "decentraland-gatsby-deploy/dist/recepies/buildGatsby";
import { variable } from "decentraland-gatsby-deploy/dist/pulumi/env";

export = async function main() {
  if (env === 'dev') {
    return {}
  }

  return buildGatsby({
    name: 'governance',
    // contentSource: resolve(__dirname, '../public'),
    usePublicTLD: process.env['USE_PUBLIC_TLD'] === 'true',
    useSecurityHeaders: true,
    serviceEnvironment: [
      variable('NODE_ENV', 'production')
    ],
    contentRoutingRules: {
      '/en/*': '/$1'
    },
    // serviceSource: '.',
    serviceImage: process.env["CI_REGISTRY_IMAGE"],
    servicePaths: [
      '/proposal/',
      '/api/*',
      '/metrics',
      '/metrics/*',
      '/sitemap.xml',
      '/sitemap.static.xml',
      '/sitemap.proposals.xml',
    ]
  })
}