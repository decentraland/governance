import React from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { SignIn } from 'decentraland-ui/dist/components/SignIn/SignIn'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'

import locations from '../../modules/locations'

import './LogIn.css'

type LogInProps = {
  title: string
  description: string
}

function handleBack() {
  if ((window as any).routeUpdate) {
    window.history.back()
  } else {
    navigate(locations.proposals())
  }
}

const IMAGE_URL = 'https://decentraland.org/images/decentraland.png'

function LogIn({ title, description }: LogInProps) {
  const [, accountState] = useAuthContext()
  const t = useFormatMessage()
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })

  if (isMobile) {
    return (
      <Container className="LoginMobile__Container">
        <Head title={title} description={description} image={IMAGE_URL} />
        <img src={IMAGE_URL} className="LoginMobile__Logo" />
        <Paragraph semiBold className="LoginMobile__Title">
          {t(`mobile_login.exclamation`)}
        </Paragraph>
        <Paragraph semiBold className="LoginMobile__Message">
          {t(`mobile_login.message`)}
        </Paragraph>
        <Button primary onClick={handleBack}>
          {t(`mobile_login.button`)}
        </Button>
      </Container>
    )
  }

  return (
    <Container>
      <Head title={title} description={description} image={IMAGE_URL} />
      <SignIn isConnecting={accountState.selecting || accountState.loading} onConnect={() => accountState.select()} />
    </Container>
  )
}

export default React.memo(LogIn)
