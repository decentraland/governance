/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it
import React from "react"
import 'semantic-ui-css/semantic.min.css'
import 'balloon-css/balloon.min.css'
import 'decentraland-ui/dist/themes/base-theme.css'
import 'decentraland-ui/dist/themes/alternative/light-theme.css'
import './src/theme.css'

// import Helmet from "react-helmet"
import AuthProvider from "decentraland-gatsby/dist/context/Auth/AuthProvider"
import FeatureFlagProvider from "decentraland-gatsby/dist/context/FeatureFlag/FeatureFlagProvider"
import Layout from "decentraland-gatsby/dist/components/Layout/Layout"
import UserMenu from "decentraland-gatsby/dist/components/User/UserMenu"
import segment from "decentraland-gatsby/dist/utils/segment/segment"
import UrlParamsContextProvider from "./src/components/Context/UrlParamsContext" 

export const wrapRootElement = ({ element }) => (
  <AuthProvider>
    <FeatureFlagProvider endpoint="https://feature-flags.decentraland.org/dao.json">
        {element}
    </FeatureFlagProvider>
  </AuthProvider>
)

export const wrapPageElement = ({ element, props }) => {
  return <UrlParamsContextProvider>
    <Layout
      {...props}
      rightMenu={<UserMenu />}
    >
      {element}
    </Layout>
  </UrlParamsContextProvider>
}

export const onClientEntry = () => {
  segment((analytics) => analytics.page())
}

export const onRouteUpdate = () => {
  window.routeUpdate = window.routeUpdate === undefined ? 0 : window.routeUpdate + 1
  segment((analytics) => analytics.page())
}
