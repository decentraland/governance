import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import useFormatMessage from '../../../hooks/useFormatMessage'
import VotingPower from '../../Token/VotingPower'

import './VotingPowerDistributionPopup.css'

interface Props {
  label: string
  amount: number
  percentage: string
  children: React.ReactNode
}

const VotingPowerDistributionPopup = ({ label, amount, percentage, children }: Props) => {
  const t = useFormatMessage()

  return (
    <Popup className="VotingPowerDistributionPopup" position="top center" trigger={children} on="hover">
      <Popup.Content>
        <div className="VotingPowerDistributionPopup">
          <div className="VotingPowerDistributionPopup__Label">{label}</div>
          <VotingPower value={amount} />
          <div className="VotingPowerDistributionPopup__Percentage">
            {t('modal.vp_delegation.details.stats_popup_percentage', { percentage })}
          </div>
        </div>
      </Popup.Content>
    </Popup>
  )
}

export default VotingPowerDistributionPopup
