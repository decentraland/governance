import React from 'react'

import { Size } from 'decentraland-gatsby/dist/components/Props/types'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import profiles, { Profile } from 'decentraland-gatsby/dist/utils/loader/profile'
import { Header, HeaderProps } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import './UserBalanceStats.css'
import Username from './Username'

export type UserBalanceStatsProps = {
  size?: HeaderProps['size']
  to?: string
  className?: string
  address?: string
  disabled?: boolean
  sub?: boolean
}

export default React.memo(function UserBalanceStats(props: UserBalanceStatsProps) {
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
        <Username address={props.address} size={Size.Large} />
      </Header>
      <Loader size="small" active={profileState.loading} />
    </span>
  )
})
