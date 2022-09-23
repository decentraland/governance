import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import HelperText from '../../Helper/HelperText'

import './VotingPowerDistributionLabel.css'

interface Props {
  labelText: string
  tooltipText: string
  className: string
}

const VotingPowerDistributionLabel = ({ labelText, tooltipText, className }: Props) => {
  return (
    <div className="VotingPowerDistributionLabel">
      <div className={TokenList.join(['VotingPowerDistributionLabel__Circle', className])} />
      <HelperText labelText={labelText} tooltipText={tooltipText} position="bottom center" />
    </div>
  )
}

export default VotingPowerDistributionLabel
