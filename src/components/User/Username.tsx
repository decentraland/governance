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
  showName?: boolean
  className?: string
  blockieScale?: number
}

const Username = ({ address, size, linked, showName = true, blockieScale = 3, className }: Props) => {
  const { profile } = useProfile(address)

  const userElement = (
    <>
      {profile && !profile.isDefaultProfile && <Avatar size={size || 'mini'} address={address} />}
      {profile && showName && profile.name}
      {profile && !showName && <Address value={address} />}
      {(!profile || profile.isDefaultProfile) && !!address && (
        <Blockie scale={blockieScale} seed={address || ''}>
          <Address value={address || ''} />
        </Blockie>
      )}
    </>
  )

  return (
    <>
      {linked ? (
        <Link className={TokenList.join(['Username', className])} href={locations.balance({ address: address })}>
          {userElement}
        </Link>
      ) : (
        <span className={TokenList.join(['Username', className])}>{userElement}</span>
      )}
    </>
  )
}

export default Username
