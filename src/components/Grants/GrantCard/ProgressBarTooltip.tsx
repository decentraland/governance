import React from 'react'

import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import { GrantAttributes } from '../../../entities/Proposal/types'
import { CLIFF_PERIOD_IN_DAYS } from '../../../entities/Proposal/utils'
import { formatDate } from '../../../modules/time'

interface Props {
  grant: GrantAttributes
  isInCliff: boolean
  children: React.ReactNode
}

function ProgressBarTooltip({ grant, isInCliff, children }: Props) {
  const t = useFormatMessage()
  const intl = useIntl()

  const { contract, tx_amount, token, enacted_at } = grant
  const isOTP = !contract
  const vestedAmount = (contract ? contract.vestedAmount : tx_amount) || 0
  const releasedAmount = !isOTP ? contract.released : 0

  let textToShow = ''

  if (isInCliff) {
    const now = Time.utc()
    const vestingStartDate = Time.unix(enacted_at)
    const elapsedSinceVestingStarted = now.diff(vestingStartDate, 'day')
    const daysToGo = CLIFF_PERIOD_IN_DAYS - elapsedSinceVestingStarted

    textToShow = t('page.profile.grants.cliff_period', { count: daysToGo })
  } else if (isOTP) {
    textToShow = t('page.profile.grants.one_time_tx', { time: formatDate(new Date(enacted_at * 1000)) })
  } else if (releasedAmount > 0) {
    textToShow = t('page.profile.grants.released', { amount: intl.formatNumber(releasedAmount), token })
  } else {
    textToShow = t('page.profile.grants.vested', { amount: intl.formatNumber(vestedAmount), token })
  }

  return <Popup content={textToShow} position="top center" trigger={children} on="hover" />
}

export default ProgressBarTooltip
