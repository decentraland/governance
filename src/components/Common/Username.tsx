import classNames from 'classnames'
import { Address } from 'decentraland-ui/dist/components/Address/Address'

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

const Username = ({
  address,
  size = AvatarSize.xs,
  linked,
  variant = UsernameVariant.Full,
  strong = false,
  className,
}: Props) => {
  const { profile, isLoadingDclProfile } = useDclProfile(address)
  const { username, avatarUrl } = profile
  const isAddressVariant = variant === UsernameVariant.Address
  const isFullVariant = variant === UsernameVariant.Full
  const checksumAddress = address ? getChecksumAddress(address) : ''
  const customClassNames = classNames('Username', `Username--${variant}`, className)

  const Component = linked ? Link : 'span'

  return (
    <Component className={customClassNames} href={linked ? locations.profile({ address: checksumAddress }) : undefined}>
      {isAddressVariant && <>{username || <Address value={checksumAddress} className={className} strong={strong} />}</>}

      {!isAddressVariant && (
        <>
          <Avatar size={size} address={address} avatar={avatarUrl} isLoadingDclProfile={isLoadingDclProfile} />
          {username && isFullVariant && <span className="Username__Name">{username}</span>}
          {!username && isFullVariant && <Address value={checksumAddress} strong={strong} />}
        </>
      )}
    </Component>
  )
}

export default Username
