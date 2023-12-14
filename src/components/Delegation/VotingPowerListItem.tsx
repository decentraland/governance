import classNames from 'classnames'

import Username from '../Common/Username'
import VotingPower from '../Token/VotingPower'

import './VotingPowerListItem.css'

export type VotingPowerListModalItemProps = React.HTMLAttributes<HTMLDivElement> & {
  address: string
  votingPower: number | null
}

export default function VotingPowerListItem({
  address,
  votingPower,
  className,
  ...props
}: VotingPowerListModalItemProps) {
  return (
    <div className={classNames('VotingPowerListItem', className)} {...props}>
      <div className="VotingPowerListModalItem__Profile">
        <Username address={address} size="xxs" linked />
      </div>
      <VotingPower secondary value={votingPower || 0} size="small" />
    </div>
  )
}
