import classNames from 'classnames'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'

import { getChecksumAddress } from '../../entities/Snapshot/utils'
import useProfile from '../../hooks/useProfile'
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
  const { hasDclProfile, displayableAddress, profileHasName } = useProfile(address)
  const blockieScale = getBlockieScale(size)
  const isAddressVariant = variant === UsernameVariant.Address
  const isFullVariant = variant === UsernameVariant.Full
  const checksumAddress = address ? getChecksumAddress(address) : ''
  const customClassNames = classNames('Username', `Username--${variant}`, className)

  const Component = linked ? Link : 'span'

  return (
    <Component className={customClassNames} href={linked ? locations.profile({ address: checksumAddress }) : undefined}>
      {isAddressVariant && (
        <>
          {profileHasName && displayableAddress}
          {!profileHasName && <Address value={checksumAddress} className={className} strong={strong} />}
        </>
      )}

      {!isAddressVariant && (
        <>
          {hasDclProfile && (
            <>
              <Avatar size={size} address={address} />
              {profileHasName && isFullVariant && <span className="Username__Name">{displayableAddress}</span>}
              {!profileHasName && isFullVariant && <Address value={checksumAddress} strong={strong} />}
            </>
          )}

          {!hasDclProfile && (
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
