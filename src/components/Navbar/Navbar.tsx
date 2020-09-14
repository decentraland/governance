import React from 'react'
import { Navbar as BaseNavbar } from 'decentraland-dapps/dist/containers'

import { Props } from './Navbar.types'
import './Navbar.css'

export default class Navbar extends React.PureComponent<Props, any> {
  render() {

    return (
      <BaseNavbar
        {...this.props}
        activePage="dao"
        isFullscreen={this.props.isFullscreen ?? true}
        onSignIn={this.props.onConnect}
        // onClickAccount={handleOnClickAccount}
        middleMenu={
          undefined
          // <Menu.Item
          //   className={pathname === locations.activity() ? 'active' : ''}
          // >
          //   <Icon
          //     className={hasPendingTransactions ? 'pending' : ''}
          //     name="bell"
          //     onClick={handleClickActivity}
          //   />
          // </Menu.Item>
        }
      />
    )
  }
}
