import React from 'react'

import classNames from 'classnames'
import { Size, SizeProps } from 'decentraland-gatsby/dist/components/Props/types'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'

import { getChecksumAddress } from '../../entities/Snapshot/utils'
import useProfile from '../../hooks/useProfile'
import locations from '../../utils/locations'
import Link from '../Common/Link'

import './Username.css'

enum UsernameVariant {
  Avatar = 'avatar',
  Address = 'address',
  Full = 'full',
}

type Props = SizeProps & {
  address: string
  linked?: boolean
  className?: string
  variant?: `${UsernameVariant}`
  strong?: boolean
}

function getBlockieScale(size?: string) {
  const DEFAULT_BLOCKIE_SCALE = 3.35
  switch (size) {
    case Size.Mini:
      return 3
    case Size.Tiny:
      return DEFAULT_BLOCKIE_SCALE
    case Size.Small:
      return 4.9
    case Size.Medium:
      return 7
    case Size.Large:
      return 8.4
    case Size.Big:
      return 10.5
    case Size.Huge:
      return 14.5
    case Size.Massive:
      return 20
    case Size.Full:
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
              <Avatar size={size || 'mini'} address={address} />
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
