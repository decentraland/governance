import { useIntl } from 'react-intl'

import { DAO_VESTING_CONTRACT_ADDRESS } from '../../constants'
import { CURRENCY_FORMAT_OPTIONS, getVestingContractUrl } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import useManaPrice from '../../hooks/useManaPrice'
import useVestingContractData from '../../hooks/useVestingContractData'
import FinancialCard from '../Updates/FinancialCard'

import './DaoFinancial.css'

function DaoVestingCard() {
  const t = useFormatMessage()
  const { vestingData } = useVestingContractData([DAO_VESTING_CONTRACT_ADDRESS])
  const { releasable, released, total } = vestingData?.[0] || {}
  const vested = releasable && released ? releasable + released : undefined
  const { formatNumber } = useIntl()
  const manaPrice = useManaPrice()

  return (
    <div className="DaoFinancial">
      <FinancialCard
        title={t('page.transparency.mission.vesting_title')}
        value={t('page.transparency.mission.releasable_value', {
          value: releasable && manaPrice ? formatNumber(releasable * manaPrice, CURRENCY_FORMAT_OPTIONS) : '$--',
        })}
        subtitle={t('page.transparency.mission.vesting_subtitle', {
          value:
            total && vested && manaPrice ? formatNumber((total - vested) * manaPrice, CURRENCY_FORMAT_OPTIONS) : '$--',
        })}
        href={getVestingContractUrl(DAO_VESTING_CONTRACT_ADDRESS)}
        helper={t('page.transparency.mission.vesting_helper')}
      />
    </div>
  )
}

export default DaoVestingCard
