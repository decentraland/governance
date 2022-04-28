import React from 'react'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Profile } from 'decentraland-gatsby/dist/utils/loader/profile'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import locations from '../../modules/locations'

interface Props {
  className?: string
  profile?: Profile | null
  address?: string
}

export default function Username({ className, profile, address = '' }: Props) {
  const hasProfileName = profile && profile.name

  return (
    <Link className={TokenList.join([className])} href={locations.balance({ address })}>
      {hasProfileName && <Avatar size="mini" address={profile?.ethAddress} style={{ marginRight: '.5rem' }} />}
      {hasProfileName}
      {!hasProfileName && !!address && (
        <Blockie scale={3} seed={address}>
          <Address value={address} />
        </Blockie>
      )}
    </Link>
  )
}
