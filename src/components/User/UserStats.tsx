import React from 'react'

import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import profiles, { Profile } from 'decentraland-gatsby/dist/utils/loader/profile'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Blockie } from 'decentraland-ui/dist/components/Blockie/Blockie'
import { Header, HeaderProps } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import './UserStats.css'

export type UserStatsProps = {
  size?: HeaderProps['size']
  to?: string
  className?: string
  address?: string
  disabled?: boolean
  sub?: boolean
}

function sizeToScale(size?: HeaderProps['size']) {
  switch (size) {
    case 'huge':
      return 8
    case 'medium':
      return 5
    case 'small':
      return 3
    default:
      return undefined
  }
}

export default React.memo(function UserStats(props: UserStatsProps) {
  const [profile, profileState] = useAsyncMemo<Profile>(() => profiles.load(props.address || ''), [props.address])
  const isProfile = !!profile && !profile.isDefaultProfile

  if (!props.address) {
    return null
  }

  return (
    <span
      className={TokenList.join([
        'dcl stats',
        'UserStats',
        props.disabled && 'disabled',
        props.sub === false ? 'without-sub' : 'with-sub',
        props.className,
      ])}
    >
      {props.sub !== false && <Header sub>{isProfile ? 'PROFILE' : 'ADDRESS'}</Header>}
      <Header size={props.size} className="UserStatsHeader" as={props.to ? Link : undefined} href={props.to}>
        {!isProfile && (
          <Blockie seed={props.address!} scale={sizeToScale(props.size)}>
            <Address value={props.address!} strong />
          </Blockie>
        )}
        {isProfile && <Avatar address={profile!.ethAddress} size="medium" />}
        {isProfile && profile!.name}
      </Header>
      <Loader size="small" active={profileState.loading} />
    </span>
  )
})
