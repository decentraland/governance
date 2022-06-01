import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import VotingPower from '../Token/VotingPower'
import Username from '../User/Username'

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
    <div className={TokenList.join(['VotingPowerListItem', className])} {...props}>
      <div className="VotingPowerListModalItem__Profile">
        <Username address={address} size={'tiny'} linked />
      </div>
      <VotingPower secondary value={votingPower || 0} size="small" />
    </div>
  )
}
