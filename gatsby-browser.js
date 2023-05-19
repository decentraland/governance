/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */
import React from 'react'

import 'core-js/features/set-immediate'
import 'semantic-ui-css/semantic.min.css'
import 'balloon-css/balloon.min.css'
import 'decentraland-ui/dist/themes/base-theme.css'
import 'decentraland-ui/dist/themes/alternative/light-theme.css'
import './src/theme.css'

import { IntlProvider } from 'decentraland-gatsby/dist/plugins/intl'
import AuthProvider from 'decentraland-gatsby/dist/context/Auth/AuthProvider'
import FeatureFlagProvider from 'decentraland-gatsby/dist/context/FeatureFlag/FeatureFlagProvider'
import Layout from 'decentraland-gatsby/dist/components/Layout/Layout'
import segment from 'decentraland-gatsby/dist/utils/segment/segment'
import Navbar from './src/components/Layout/Navbar'
import IdentityModalContextProvider from './src/components/Context/IdentityModalContext'
import BurgerMenuStatusContextProvider from './src/components/Context/BurgerMenuStatusContext'
import ExternalLinkWarningModal from './src/components/Modal/ExternalLinkWarningModal/ExternalLinkWarningModal'
import IdentityConnectModal from './src/components/Modal/IdentityConnectModal/IdentityConnectModal'
import Segment from "decentraland-gatsby/dist/components/Development/Segment"
import Rollbar from "decentraland-gatsby/dist/components/Development/Rollbar"
import { ROLLBAR_TOKEN } from "./src/constants"

export const wrapRootElement = ({ element }) => {
  const isBrowser = typeof window !== 'undefined'
   
  return (
    <AuthProvider>
      <FeatureFlagProvider endpoint="https://feature-flags.decentraland.org/dao.json">{element}</FeatureFlagProvider>
      {isBrowser && ROLLBAR_TOKEN && <Rollbar key="rollbar" accessToken={ROLLBAR_TOKEN} />}
      {isBrowser && SEGMENT_KEY && <Segment key="segment" segmentKey={SEGMENT_KEY} />}
    </AuthProvider>
  )
}

export const wrapPageElement = ({ element, props }) => {
  return (
    <IntlProvider {...props.pageContext.intl}>
      <IdentityModalContextProvider>
        <BurgerMenuStatusContextProvider>
          <Layout {...props} rightMenu={<Navbar />}>
            {element}
          </Layout>
        </BurgerMenuStatusContextProvider>
        <ExternalLinkWarningModal />
        <IdentityConnectModal />
      </IdentityModalContextProvider>
    </IntlProvider>
  )
}

export const onClientEntry = () => {
  segment((analytics) => analytics.page())
}

export const onRouteUpdate = () => {
  window.routeUpdate = window.routeUpdate === undefined ? 0 : window.routeUpdate + 1
  segment((analytics) => analytics.page())
}

eval('Math.pow = (a, b) => a ** b')
