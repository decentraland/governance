import React from 'react'
import { Stats } from "decentraland-ui/dist/components/Stats/Stats"
import { Blockie } from "decentraland-ui/dist/components/Blockie/Blockie"
import { Address } from "decentraland-ui/dist/components/Address/Address"
import { Loader } from "decentraland-ui/dist/components/Loader/Loader"
import { Header, HeaderProps } from "decentraland-ui/dist/components/Header/Header"
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import './UserStats.css'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Link } from 'gatsby-plugin-intl'

export type UserStatsProps = {
  size?: HeaderProps['size'],
  to?: string
  className?: string
  address?: string
  disabled?: boolean
  sub?: boolean
}

function sizeToScale (size?: HeaderProps['size']) {
  switch (size) {
    case "huge":
      return 8
    case "medium":
      return 5
    default:
      return undefined
  }
}

export default React.memo(function UserStats(props: UserStatsProps) {
  const [profile, profileState] = useAsyncMemo(() => profiles.load(props.address || ''), [props.address])
  const isProfile = !!profile && !profile.isDefaultProfile

  if (!props.address) {
    return null
  }

  return <Stats
    title={props.sub === false ? '' : isProfile ? 'PROFILE' : 'ADDRESS'}
    className={TokenList.join([
      'UserStats',
      props.disabled && 'disabled',
      props.sub === false ? 'without-sub' : 'with-sub',
      props.className
    ])}
  >
    <Header size={props.size} className="UserStatsHeader" as={props.to ? Link : undefined} to={props.to}>
      {!isProfile && <Blockie seed={props.address!} scale={sizeToScale(props.size)}>
        <Address value={props.address!} strong />
      </Blockie>}
      {}
      {isProfile && <Avatar address={profile!.ethAddress} size="medium" />}
      {isProfile && profile!.name}
    </Header>
    <Loader size="small" active={profileState.loading} />
  </Stats>
})