import React from 'react'

import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'

import useProfile from '../../hooks/useProfile'
import locations from '../../modules/locations'
import VotingPower from '../Token/VotingPower'

import './VotingPowerListItem.css'

export type VotingPowerListModalItemProps = React.HTMLAttributes<HTMLDivElement> & {
  address: string | undefined
  votingPower: number | null
}

export default function VotingPowerListItem({
  address,
  votingPower,
  className,
  ...props
}: VotingPowerListModalItemProps) {
  const { profile, hasDclProfile } = useProfile(address)

  return (
    <div className={TokenList.join(['VotingPowerListItem', className])} {...props}>
      {!hasDclProfile && (
        <div className="VotingPowerListModalItem__Profile">
          <Blockie className="VotingPowerListModalItem__Blockie" seed={address!} scale={3} />
          <a href={locations.balance({ address: address })}>
            <Address className={'VotingPowerListModalItem__Address'} value={address!} />
          </a>
        </div>
      )}
      {hasDclProfile && (
        <div className="VotingPowerListModalItem__Profile">
          <Avatar address={profile!.ethAddress} size="tiny" />
          <a className={'VotingPowerListModalItem__Address'} href={locations.balance({ address: address })}>
            <span>{profile!.name}</span>
          </a>
        </div>
      )}
      <VotingPower secondary value={votingPower || 0} size="small" />
    </div>
  )
}
