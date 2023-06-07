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
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { IntlProvider } from 'decentraland-gatsby/dist/plugins/intl'
import AuthProvider from 'decentraland-gatsby/dist/context/Auth/AuthProvider'
import FeatureFlagProvider from 'decentraland-gatsby/dist/context/FeatureFlag/FeatureFlagProvider'
import segment from 'decentraland-gatsby/dist/utils/segment/segment'
import Layout from './src/components/Layout/Layout'
import Navbar from './src/components/Layout/Navbar'
import IdentityModalContextProvider from './src/components/Context/IdentityModalContext'
import BurgerMenuStatusContextProvider from './src/components/Context/BurgerMenuStatusContext'
import ExternalLinkWarningModal from './src/components/Modal/ExternalLinkWarningModal/ExternalLinkWarningModal'
import IdentityConnectModal from './src/components/Modal/IdentityConnectModal/IdentityConnectModal'
import Segment from "decentraland-gatsby/dist/components/Development/Segment"
import { SEGMENT_KEY } from "./src/constants"

const queryClient = new QueryClient()

export const wrapRootElement = ({ element }) => {
  const isWindowDefined = typeof window !== 'undefined'
   
  return (
    <AuthProvider>
      <FeatureFlagProvider endpoint="https://feature-flags.decentraland.org/dao.json">{element}</FeatureFlagProvider>
      {isWindowDefined && SEGMENT_KEY && <Segment key="segment" segmentKey={SEGMENT_KEY} />}
    </AuthProvider>
  )
}

export const wrapPageElement = ({ element, props }) => {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
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
