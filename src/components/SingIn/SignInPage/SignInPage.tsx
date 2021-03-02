import React from 'react'
import { Page } from 'decentraland-ui/dist/components/Page/Page'
import { Navbar } from 'components/Navbar'
import { Footer } from 'components/Footer'
import SignIn from 'decentraland-dapps/dist/containers/SignInPage'
import { Navigation } from 'components/Navigation'
import './SignInPage.css'

const SignInPage = () => {
  return (
    <>
      <Navbar isFullscreen />
      <Navigation />
      <Page className="SignInPage" isFullscreen>
        <SignIn />
      </Page>
      <Footer isFullscreen />
    </>
  )
}

export default React.memo(SignInPage)