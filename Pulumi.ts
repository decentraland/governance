// import { resolve } from "path";
import { buildGatsby } from "decentraland-gatsby-deploy/dist/recepies/buildGatsby";
import { variable } from "decentraland-gatsby-deploy/dist/pulumi/env";

export = async function main() {
  return buildGatsby({
    name: 'governance',
    // contentSource: resolve(__dirname, '../public'),
    usePublicTLD: process.env['USE_PUBLIC_TLD'] === 'true',
    serviceEnvironment: [
      variable('NODE_ENV', 'production')
    ],
    contentRoutingRules: {
      '/en/*': '/$1'
    },
    serviceSource: '.',
    servicePaths: [
      '/',
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