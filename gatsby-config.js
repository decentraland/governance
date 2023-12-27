/* eslint-disable */
const { default: developMiddleware } = require('decentraland-gatsby/dist/utils/development/developMiddleware')

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

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
  pathPrefix: '/governance',
  developMiddleware: developMiddleware([
    {
      prefix: `/api`,
      url: `http://127.0.0.1:4000`,
    },
    {
      prefix: `/auth`,
      url: `https://decentraland.zone/auth`,
      followRedirects: true,
      changeOrigin: true,
    },
  ]),
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
  ],
}
