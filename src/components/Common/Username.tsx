import classNames from 'classnames'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'

import { getChecksumAddress } from '../../entities/Snapshot/utils'
import useDclProfile from '../../hooks/useDclProfile'
import locations from '../../utils/locations'
import Avatar, { AvatarSize } from '../Common/Avatar'
import Link from '../Common/Typography/Link'

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
  const { username, avatar, hasCustomAvatar, isLoadingDclProfile } = useDclProfile(address)
  const blockieScale = getBlockieScale(size)
  const isAddressVariant = variant === UsernameVariant.Address
  const isFullVariant = variant === UsernameVariant.Full
  const checksumAddress = address ? getChecksumAddress(address) : ''
  const customClassNames = classNames('Username', `Username--${variant}`, className)

  const Component = linked ? Link : 'span'

  return (
    <Component className={customClassNames} href={linked ? locations.profile({ address: checksumAddress }) : undefined}>
      {isAddressVariant && (
        <>{username ? username : <Address value={checksumAddress} className={className} strong={strong} />}</>
      )}

      {!isAddressVariant && (
        <>
          {hasCustomAvatar && (
            <>
              <Avatar size={size} address={address} avatar={avatar} isLoadingDclProfile={isLoadingDclProfile} />
              {username && isFullVariant && <span className="Username__Name">{username}</span>}
              {!username && isFullVariant && <Address value={checksumAddress} strong={strong} />}
            </>
          )}

          {!hasCustomAvatar && (
            <>
              <Blockie scale={blockieScale} seed={checksumAddress} />
              {isFullVariant && <Address value={checksumAddress} strong={strong} />}
            </>
          )}
        </>
      )}
    </Component>
  )
}

export default Username
