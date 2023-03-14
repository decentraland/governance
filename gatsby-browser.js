/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */
import React from 'react'

import 'balloon-css/balloon.min.css'
import 'core-js/features/set-immediate'
import Rollbar from 'decentraland-gatsby/dist/components/Development/Rollbar'
import Segment from 'decentraland-gatsby/dist/components/Development/Segment'
import Layout from 'decentraland-gatsby/dist/components/Layout/Layout'
import AuthProvider from 'decentraland-gatsby/dist/context/Auth/AuthProvider'
import FeatureFlagProvider from 'decentraland-gatsby/dist/context/FeatureFlag/FeatureFlagProvider'
import { IntlProvider } from 'decentraland-gatsby/dist/plugins/intl'
import segment from 'decentraland-gatsby/dist/utils/segment/segment'
import 'decentraland-ui/dist/themes/alternative/light-theme.css'
import 'decentraland-ui/dist/themes/base-theme.css'
import 'semantic-ui-css/semantic.min.css'

import BurgerMenuStatusContextProvider from './src/components/Context/BurgerMenuStatusContext'
import ExternalLinkContextProvider from './src/components/Context/ExternalLinkContext'
import Navbar from './src/components/Layout/Navbar'
import ExternalLinkWarningModalWrapper from './src/components/Modal/ExternalLinkWarningModalWrapper'
import { ROLLBAR_TOKEN, SEGMENT_KEY } from './src/constants'
import './src/theme.css'

export function wrapRootElement({ element }) {
  return (
    <AuthProvider>
      <FeatureFlagProvider endpoint="https://feature-flags.decentraland.org/dao.json">{element}</FeatureFlagProvider>
      {typeof window !== 'undefined' && ROLLBAR_TOKEN && <Rollbar key="rollbar" accessToken={ROLLBAR_TOKEN} />}
      {typeof window !== 'undefined' && SEGMENT_KEY && <Segment key="segment" segmentKey={SEGMENT_KEY} />}
    </AuthProvider>
  )
}

export const wrapPageElement = ({ element, props }) => {
  return (
    <IntlProvider {...props.pageContext.intl}>
      <ExternalLinkContextProvider>
        <BurgerMenuStatusContextProvider>
          <Layout {...props} rightMenu={<Navbar />}>
            {element}
          </Layout>
        </BurgerMenuStatusContextProvider>
        <ExternalLinkWarningModalWrapper />
      </ExternalLinkContextProvider>
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
