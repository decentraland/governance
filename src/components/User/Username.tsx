import React from 'react'

import classNames from 'classnames'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'

import { getChecksumAddress } from '../../entities/Snapshot/utils'
import useProfile from '../../hooks/useProfile'
import locations from '../../utils/locations'
import Avatar, { AvatarSize } from '../Common/Avatar'

import './Username.css'

enum UsernameVariant {
  Avatar = 'avatar',
  Address = 'address',
  Full = 'full',
}

type Props = {
  size?: `${AvatarSize}`
  address: string
  linked?: boolean
  className?: string
  variant?: `${UsernameVariant}`
  strong?: boolean
}

function getBlockieScale(size?: string) {
  const DEFAULT_BLOCKIE_SCALE = 3.35
  switch (size) {
    case AvatarSize.Mini:
      return 3
    case AvatarSize.Tiny:
      return DEFAULT_BLOCKIE_SCALE
    case AvatarSize.Small:
      return 4.9
    case AvatarSize.Medium:
      return 7
    case AvatarSize.Large:
      return 8.4
    case AvatarSize.Big:
      return 10.5
    case AvatarSize.Huge:
      return 14.5
    case AvatarSize.Massive:
      return 20
    case AvatarSize.Full:
      return 42.5
    default:
      return DEFAULT_BLOCKIE_SCALE
  }
}

const Username = ({ address, size, linked, variant = UsernameVariant.Full, strong = false, className }: Props) => {
  const { profile, hasDclProfile } = useProfile(address)
  const profileHasName = hasDclProfile && profile!.name && profile!.name.length > 0
  const blockieScale = getBlockieScale(size)
  const isAddressVariant = variant === UsernameVariant.Address
  const isAvatarVariant = variant === UsernameVariant.Avatar
  const checksumAddress = address ? getChecksumAddress(address) : ''

  const userElement = (
    <>
      {isAddressVariant && (
        <>
          {profileHasName && profile!.name}
          {!profileHasName && <Address value={checksumAddress} className={className} strong={strong} />}
        </>
      )}

      {!isAddressVariant && (
        <>
          {hasDclProfile && (
            <>
              <Avatar size={size} address={address} />
              {profileHasName && !isAvatarVariant && <span>{profile!.name}</span>}
              {!profileHasName && !isAvatarVariant && <Address value={checksumAddress} strong={strong} />}
            </>
          )}

          {(!hasDclProfile || !profile) && (
            <>
              <Blockie scale={blockieScale} seed={checksumAddress} />
              {!isAvatarVariant && <Address value={checksumAddress} strong={strong} />}
            </>
          )}
        </>
      )}
    </>
  )

  return (
    <>
      {linked ? (
        <Link className={classNames('Username', className)} href={locations.profile({ address: checksumAddress })}>
          {userElement}
        </Link>
      ) : (
        <span className={classNames('Username', className)}>{userElement}</span>
      )}
    </>
  )
}

export default Username
