module.exports = {
  siteMetadata: {
    title: `Decentraland`,
    description: `Decentraland`,
    author: `@decentraland`,
  },
  proxy: {
    prefix: `/api`,
    url: `http://localhost:4000`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
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
        hash: 'sha512', // 'sha256', 'sha384' or 'sha512' ('sha512' = default)
        crossorigin: false // Optional
      }
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
        isTSX: true, // defaults to false
        // jsxPragma: `jsx`, // defaults to `React`
        allExtensions: true, // defaults to false,
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    // `gatsby-plugin-i18n`,
    {
      resolve: `gatsby-plugin-intl`,
      options: {
        // language JSON resource path
        path: `${__dirname}/src/intl`,
        // supported language
        languages: [`en` /*, `es`, `zh` */],
        // language file path
        defaultLanguage: `en`,
        // option to redirect to `/ko` when connecting `/`
        redirect: false,
      },
    },
  ],
}
