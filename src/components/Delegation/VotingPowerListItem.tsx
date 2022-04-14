import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import VotingPower from '../Token/VotingPower'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import React from 'react'
import useProfile from '../../hooks/useProfile'
import './VotingPowerListItem.css'
import locations from '../../modules/locations'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

export type VotingPowerListModalItemProps = React.HTMLAttributes<HTMLDivElement> & {
  address: string | undefined
  votingPower: number | null
}

export default function VotingPowerListItem({ address, votingPower, className, ...props }: VotingPowerListModalItemProps) {
  const { profile, hasDclAvatar } = useProfile(address)

  return (
    <div className={TokenList.join(['VotingPowerListItem', className])} {...props}>
      {!hasDclAvatar && (
        <div className='VotingPowerListModalItem__Profile'>
          <Blockie className='VotingPowerListModalItem__Blockie' seed={address!} scale={3} />
          <a href={locations.balance({ address: address })}>
            <Address className={'VotingPowerListModalItem__Address'} value={address!} />
          </a>
        </div>
      )}
      {hasDclAvatar && (
        <div className='VotingPowerListModalItem__Profile'>
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
