import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import TranslationProvider from 'decentraland-dapps/dist/providers/TranslationProvider'
import WalletProvider from 'decentraland-dapps/dist/providers/WalletProvider'

import { store, history } from 'modules/root/store'
// import * as modals from 'components/Modals'
import * as languages from 'modules/translation/languages'
import Routes from 'routing'

import './modules/analytics/track'
// import './modules/analytics/rollbar'
// import './modules/analytics/hotjar'
import './theme.css'
import './index.css'

ReactDOM.render(
  <Provider store={store}>
    <TranslationProvider locales={Object.keys(languages)}>
      <WalletProvider>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </WalletProvider>
    </TranslationProvider>
  </Provider>,
  document.getElementById('root')
)
