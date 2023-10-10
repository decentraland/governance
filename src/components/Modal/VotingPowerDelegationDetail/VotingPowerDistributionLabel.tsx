import classNames from 'classnames'
import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import HelperText from '../../Helper/HelperText'

import './VotingPowerDistributionLabel.css'

interface Props {
  labelText: string
  tooltipText: string
  subtitleText: string
  className: string
}

const VotingPowerDistributionLabel = ({ labelText, tooltipText, subtitleText, className }: Props) => {
  return (
    <>
      <Mobile>
        <div className="VotingPowerDistributionLabel__Mobile">
          <div className={classNames('VotingPowerDistributionLabel__Circle', className)} />
          <div className="VotingPowerDistributionLabel__FullLabel">
            <span className="VotingPowerDistributionLabel__Title">{labelText}</span>
            <span className="VotingPowerDistributionLabel__Subtitle">{subtitleText}</span>
          </div>
        </div>
      </Mobile>
      <NotMobile>
        <div className="VotingPowerDistributionLabel">
          <div className={classNames('VotingPowerDistributionLabel__Circle', className)} />
          <HelperText labelText={labelText} tooltipText={tooltipText} position="bottom center" />
        </div>
      </NotMobile>
    </>
  )
}

export default VotingPowerDistributionLabel
