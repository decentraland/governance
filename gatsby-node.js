/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const sharp = require('sharp')
sharp.cache(false)
sharp.simd(false)

exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  if (stage === 'build-javascript') {
    actions.setWebpackConfig({
      devtool: false,
    })
  }
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        assert: false,
        crypto: false,
        http: false,
        https: false,
        os: false,
        stream: false,
        util: false,
        zlib: false,
        url: false,
      },
    },
  })
  // Silence 'conflicting order' warning for CSS modules.
  // This is only an issue with regular CSS being imported.
  if (stage === 'build-javascript' || stage === 'develop') {
    const config = getConfig()
    const miniCssExtractPlugin = config.plugins.find((plugin) => plugin.constructor.name === 'MiniCssExtractPlugin')
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.ignoreOrder = true
    }
    actions.replaceWebpackConfig(config)
  }
}
