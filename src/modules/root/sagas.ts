import { all } from 'redux-saga/effects'

import { createAnalyticsSaga } from 'decentraland-dapps/dist/modules/analytics/sagas'
import { transactionSaga } from 'decentraland-dapps/dist/modules/transaction/sagas'

import { walletSaga } from 'modules/wallet/sagas'
import { translationSaga } from 'modules/translation/sagas'
import { organizationSaga } from 'modules/organization/sagas'
import { appSaga } from 'modules/app/sagas'
import { voteSaga } from 'modules/vote/sagas'
import { castSaga } from 'modules/cast/sagas'
import { voteDescriptionSaga } from 'modules/description/sagas'

const analyticsSaga = createAnalyticsSaga()

export function* rootSaga() {
  yield all([
    analyticsSaga(),
    transactionSaga(),
    translationSaga(),
    organizationSaga(),
    appSaga(),
    voteSaga(),
    voteDescriptionSaga(),
    castSaga(),
    walletSaga()
  ])
}
