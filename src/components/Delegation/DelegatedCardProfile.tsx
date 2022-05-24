import React from 'react'

import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import useProfile from '../../hooks/useProfile'
import locations from '../../modules/locations'
import VotingPower from '../Token/VotingPower'

import './DelegatedCardProfile.css'

export type DelegatedCardProfileProps = {
  address: string
  pickedBy?: number
  votingPower?: number
}

export default function DelegatedCardProfile({ address, pickedBy, votingPower }: DelegatedCardProfileProps) {
  const t = useFormatMessage()
  const { profile, profileState, hasDclProfile } = useProfile(address)

  if (!address) {
    return null
  }

  return (
    <div className="DelegatedCardProfile">
      {!hasDclProfile && (
        <Blockie seed={address!}>
          <Address value={address!} strong />
        </Blockie>
      )}
      {hasDclProfile && (
        <div className="DelegatedCardProfile__Container">
          <Avatar className="DelegatedCardProfile__Avatar" address={profile!.ethAddress} size="big" />
          <span className="DelegatedCardProfile__Name">{profile!.name}</span>
          {(!!votingPower || !!pickedBy) && (
            <div className="DelegatedCardProfile__DescriptionContainer">
              {!!votingPower && (
                <span className="DelegatedCardProfile__Description">
                  {t('page.balance.delegations_from_voting_power')} <VotingPower secondary value={votingPower} />
                </span>
              )}
              {!!pickedBy && (
                <span className="DelegatedCardProfile__Description">
                  {t('page.balance.delegations_from_picked_by', { count: pickedBy })}
                </span>
              )}
            </div>
          )}
          <Link href={locations.balance({ address })}>{t('page.balance.delegations_from_view_profile')}</Link>
        </div>
      )}
      <Loader size="small" active={profileState.loading} />
    </div>
  )
}
