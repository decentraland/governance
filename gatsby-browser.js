/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */
import 'core-js/features/set-immediate'
import 'semantic-ui-css/semantic.min.css'
import 'balloon-css/balloon.min.css'
import 'decentraland-ui/dist/themes/base-theme.css'
import 'decentraland-ui/dist/themes/alternative/light-theme.css'
import './src/theme.css'
import './src/ui-overrides.css'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { IntlProvider } from "react-intl"
import AuthProvider from './src/front/context/AuthProvider'
import segment from 'decentraland-gatsby/dist/utils/segment/segment'
import Layout from './src/components/Layout/Layout'
import Segment from "decentraland-gatsby/dist/components/Development/Segment"
import { SEGMENT_KEY, SSO_URL } from "./src/constants"
import { flattenMessages } from "./src/utils/intl"
import en from "./src/intl/en.json"
import SnapshotStatus from "./src/components/Debug/SnapshotStatus"

const queryClient = new QueryClient()

export const wrapRootElement = ({ element }) => {
  return (
    <AuthProvider sso={SSO_URL}>
      {element}
      {SEGMENT_KEY && <Segment key="segment" segmentKey={SEGMENT_KEY} />}
    </AuthProvider>
  )
}

export const wrapPageElement = ({ element, props }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider defaultLocale='en' locale='en' messages={flattenMessages(en)}>
        <SnapshotStatus />
        <Layout {...props}>
          {element}
        </Layout>
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
