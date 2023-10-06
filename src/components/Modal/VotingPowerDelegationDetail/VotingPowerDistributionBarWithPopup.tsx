import classNames from 'classnames'

import { getFormattedPercentage } from '../../../helpers'

import './VotingPowerDistributionBarWithPopup.css'
import VotingPowerDistributionPopup from './VotingPowerDistributionPopup'

interface Props {
  value: number
  total: number
  label: string
  className: string
}

const VotingPowerDistributionBarWithPopup = ({ value, className, label, total }: Props) => {
  const valuePercentage = getFormattedPercentage(value, total)
  return (
    <>
      {value > 0 && (
        <VotingPowerDistributionPopup amount={value} percentage={valuePercentage} label={label}>
          <div
            className={classNames('VotingPowerDistributionBarWithPopup', className)}
            style={{ width: valuePercentage }}
          />
        </VotingPowerDistributionPopup>
      )}
    </>
  )
}

export default VotingPowerDistributionBarWithPopup
