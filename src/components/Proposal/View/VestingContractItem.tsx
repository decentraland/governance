import React from 'react'

import { VestingLog } from '../../../clients/VestingData'
import { getVestingContractUrl } from '../../../helpers'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { ContractVersion, TopicsByVersion } from '../../../utils/contracts/vesting'
import Time from '../../../utils/date/Time'
import Link from '../../Common/Typography/Link'
import ChevronRight from '../../Icon/ChevronRight'

import './VestingContractItem.css'

interface Props {
  address: string
  itemNumber: number
  logs: VestingLog[]
  vestingStartAt: string
}

const TOPICS_V1 = TopicsByVersion[ContractVersion.V1]
const TOPICS_V2 = TopicsByVersion[ContractVersion.V2]

const STATUS_KEYS: Record<string, string> = {
  [TOPICS_V1.REVOKE]: 'page.proposal_detail.grant.vesting_status.revoked',
  [TOPICS_V2.REVOKE]: 'page.proposal_detail.grant.vesting_status.revoked',
  [TOPICS_V2.PAUSED]: 'page.proposal_detail.grant.vesting_status.paused',
}

const formatDate = (date: string) => Time.from(date).format('DD/MM/YY')

function VestingContractItem({ address, itemNumber, logs, vestingStartAt }: Props) {
  const t = useFormatMessage()
  const lastLog = logs[0]
  const isVestingActive = logs.length === 0 || lastLog.topic === TOPICS_V2.UNPAUSED
  return (
    <Link className="VestingContractItem" target="_blank" href={getVestingContractUrl(address)}>
      <div>
        <div className="VestingContractItem__title">
          {t('page.proposal_detail.grant.vesting_dropdown_item_title', { number: itemNumber })}
        </div>
        <div className="VestingContractItem__Details">
          {isVestingActive ? (
            <>
              <span className="VestingContractItem__DetailsActive">
                {t('page.proposal_detail.grant.vesting_status.active')}
              </span>
              <span>{' · '}</span>
              <span>{t('page.proposal_detail.grant.vesting_enacted_date', { date: formatDate(vestingStartAt) })}</span>
            </>
          ) : (
            <>
              <span>
                {t(STATUS_KEYS[lastLog.topic])} {formatDate(lastLog.timestamp)}
              </span>
            </>
          )}
        </div>
      </div>
      <ChevronRight color="var(--black-400)" />
    </Link>
  )
}

export default VestingContractItem
