import React from 'react'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import useProfile from '../../hooks/useProfile'
import locations from '../../modules/locations'

const Username = ({ address }: { address: string }) => {
  const { profile } = useProfile(address)

  return (
    <Link className="DetailsSection__Value" href={locations.balance({ address: address })}>
      {profile && profile.name && <Avatar size="mini" address={profile.ethAddress} style={{ marginRight: '.5rem' }} />}
      {profile && profile.name}
      {(!profile || !profile.name) && !!address && (
        <Blockie scale={3} seed={address || ''}>
          <Address value={address || ''} />
        </Blockie>
      )}
    </Link>
  )
}

export default Username
