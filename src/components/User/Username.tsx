import React from 'react'

import { SizeProps } from 'decentraland-gatsby/dist/components/Props/types'
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
  blockieScale?: number
  iconOnly?: boolean
  addressOnly?: boolean
}

const Username = ({
  address,
  size,
  linked,
  iconOnly = false,
  addressOnly = false,
  blockieScale = 3,
  className,
}: Props) => {
  const { profile, hasDclProfile } = useProfile(address)
  const profileHasName = hasDclProfile && profile!.name && profile!.name.length > 0

  const userElement = (
    <>
      {addressOnly && (
        <>
          {profileHasName && profile!.name}
          {!profileHasName && <Address value={address || ''} className={className} />}
        </>
      )}

      {!addressOnly && (
        <>
          {hasDclProfile && (
            <>
              <Avatar size={size || 'mini'} address={address} />
              {profileHasName && !iconOnly && profile!.name}
              {!profileHasName && !iconOnly && <Address value={address || ''} />}
            </>
          )}

          {(!hasDclProfile || !profile) && (
            <Blockie scale={blockieScale} seed={address || ''}>
              {!iconOnly && <Address value={address || ''} />}
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
