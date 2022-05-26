import React from 'react'

import { Size, SizeProps } from 'decentraland-gatsby/dist/components/Props/types'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'

import useProfile from '../../hooks/useProfile'
import locations from '../../modules/locations'

import './Username.css'

type Props = SizeProps & {
  address: string
  linked?: boolean
  className?: string
  iconOnly?: boolean
  addressOnly?: boolean
  strong?: boolean
}

function getBlockieScale(size?: string) {
  const DEFAULT_BLOCKIE_SCALE = 3
  switch (size) {
    case Size.Mini:
      return 3
    case Size.Tiny:
      return 3.5
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

const Username = ({ address, size, linked, iconOnly = false, addressOnly = false, strong = false, className }: Props) => {
  const { profile, hasDclProfile } = useProfile(address)
  const profileHasName = hasDclProfile && profile!.name && profile!.name.length > 0
  const blockieScale = getBlockieScale(size)

  const userElement = (
    <>
      {addressOnly && (
        <>
          {profileHasName && profile!.name}
          {!profileHasName && <Address value={address || ''} className={className} strong={strong}/>}
        </>
      )}

      {!addressOnly && (
        <>
          {hasDclProfile && (
            <>
              <Avatar size={size || 'mini'} address={address} />
              {profileHasName && !iconOnly && profile!.name}
              {!profileHasName && !iconOnly && <Address value={address || ''} strong={strong}/>}
            </>
          )}

          {(!hasDclProfile || !profile) && (
            <Blockie scale={blockieScale} seed={address || ''}>
              {!iconOnly && <Address value={address || ''} strong={strong}/>}
            </Blockie>
          )}
        </>
      )}
    </>
  )

  return (
    <>
      {linked ? (
        <Link className={TokenList.join(['Username', className])} href={locations.balance({ address })}>
          {userElement}
        </Link>
      ) : (
        <span className={TokenList.join(['Username', className])}>{userElement}</span>
      )}
    </>
  )
}

export default Username
