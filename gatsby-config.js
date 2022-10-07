/* eslint-disable */
const { default: developMiddleware } = require('decentraland-gatsby/dist/utils/development/developMiddleware')

if (process.env.HEROKU === 'true') {
  require('dotenv').config({
    path: `.env.heroku`,
  })
} else {
  require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`,
  })
}

module.exports = {
  flags: {
    DEV_SSR: false,
    PARALLEL_SOURCING: true,
  },
  siteMetadata: {
    title: `Decentraland`,
    description: `Decentraland`,
    author: `@decentraland`,
  },
  developMiddleware: developMiddleware({
    prefix: `/api`,
    url: `http://localhost:4000`,
  }),
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-postcss`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: 'gatsby-plugin-sri',
      options: {
        hash: 'sha512',
        crossorigin: false,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Decentraland`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `node_modules/decentraland-gatsby/static/decentraland.svg`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-typescript`,
      options: {
        isTSX: true,
        allExtensions: true,
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    // `gatsby-plugin-i18n`,
    {
      resolve: `decentraland-gatsby/dist/plugins/intl`,
      options: {
        // language JSON resource path
        paths: [`${__dirname}/src/intl`],
        // supported language
        languages: [`en` /*, `es`, `zh` */],
        // language file path
        defaultLanguage: `en`,
      },
    },
  ],
}
