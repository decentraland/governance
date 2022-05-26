import React from 'react'

import { Size } from 'decentraland-gatsby/dist/components/Props/types'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'

import locations from '../../modules/locations'
import VotingPower from '../Token/VotingPower'
import Username from '../User/Username'

import './DelegatedCardProfile.css'

export type DelegatedCardProfileProps = {
  address: string
  pickedBy?: number
  votingPower?: number
}

export default function DelegatedCardProfile({ address, pickedBy, votingPower }: DelegatedCardProfileProps) {
  const t = useFormatMessage()
  if (!address) {
    return null
  }

  return (
    <div className="DelegatedCardProfile">
      <div className="DelegatedCardProfile__Container">
        <Username className="DelegatedCardProfile__Avatar" address={address} size={Size.Big} iconOnly />
        <span className="DelegatedCardProfile__Name">
          <Username address={address} addressOnly />
        </span>
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
    </div>
  )
}
