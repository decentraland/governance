// import { resolve } from "path";
import { buildGatsby } from "decentraland-gatsby-deploy/dist/recepies/buildGatsby";

export = async function main() {
  return buildGatsby({
    name: 'governance',
    // contentSource: resolve(__dirname, '../public'),
    usePublicTLD: process.env['USE_PUBLIC_TLD'] === 'true',
    contentRoutingRules: {
      '/en/*': '/$1'
    },
    serviceSource: '.',
    servicePaths: [
      '/',
      '/proposal/',
      '/api/*',
      '/metrics'
    ]
  })
}