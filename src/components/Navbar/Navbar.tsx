import React from 'react'
import { Navbar as BaseNavbar } from 'decentraland-dapps/dist/containers'
import UserMenu from 'decentraland-dapps/dist/containers/UserMenu'

import { Props } from './Navbar.types'
import { locations } from 'routing/locations'
import './Navbar.css'

export default class Navbar extends React.PureComponent<Props, any> {

  handleClickSingIn = () => {
    if (this.props.onNavigate) {
      this.props.onNavigate(locations.signIn())
    }
  }

  handleClickAccount = () => {
    if (this.props.onNavigate) {
      this.props.onNavigate(locations.wrapping())
    }
  }

  render() {
    const { pathname, wallet, profile } = this.props
    const avatars = profile?.avatars || []

    return (
      <BaseNavbar
        // {...this.props}
        activePage="dao"
        isConnected={this.props.isConnected}
        address={this.props.address}
        isFullscreen={this.props.isFullscreen ?? true}
        isSignIn={pathname === locations.signIn()}
        onSignIn={this.handleClickSingIn}
        onClickAccount={this.handleClickAccount}
        rightMenu={this.props.address && <UserMenu avatar={avatars[0]} manaBalances={{ ETHEREUM: wallet?.dao?.mana || 0 }} isSignedIn />}
      />
    )
  }
}
