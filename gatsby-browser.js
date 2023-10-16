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
import AuthProvider from 'decentraland-gatsby/dist/context/Auth/AuthProvider'
import FeatureFlagProvider from 'decentraland-gatsby/dist/context/FeatureFlag/FeatureFlagProvider'
import segment from 'decentraland-gatsby/dist/utils/segment/segment'
import Layout from './src/components/Layout/Layout'
import IdentityModalContextProvider from './src/components/Context/IdentityModalContext'
import ExternalLinkWarningModal from './src/components/Modal/ExternalLinkWarningModal/ExternalLinkWarningModal'
import IdentityConnectModal from './src/components/Modal/IdentityConnectModal/IdentityConnectModal'
import Segment from "decentraland-gatsby/dist/components/Development/Segment"
import { SEGMENT_KEY, SNAPSHOT_STATUS_ENABLED, SSO_URL } from "./src/constants"
import { flattenMessages } from "./src/utils/intl"
import en from "./src/intl/en.json"
import SnapshotStatus from "./src/components/Debug/SnapshotStatus"
import UserInformation from 'decentraland-gatsby/dist/components/User/UserInformation'

const queryClient = new QueryClient()

export const wrapRootElement = ({ element }) => {
  return (
    <AuthProvider sso={SSO_URL}>
      <FeatureFlagProvider applicationName={["dao", "dapps"]}>{element}</FeatureFlagProvider>
      {SEGMENT_KEY && <Segment key="segment" segmentKey={SEGMENT_KEY} />}
    </AuthProvider>
  )
}

export const wrapPageElement = ({ element, props }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider defaultLocale='en' locale='en' messages={flattenMessages(en)}>
        <IdentityModalContextProvider>
            {SNAPSHOT_STATUS_ENABLED && <SnapshotStatus />}
            <Layout {...props} rightMenu={<UserInformation />}>
              {element}
            </Layout>
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
