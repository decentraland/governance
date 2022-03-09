import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'
import React from 'react'
import { Container } from "decentraland-ui/dist/components/Container/Container"
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import { SignIn } from "decentraland-ui/dist/components/SignIn/SignIn"
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { navigate } from 'gatsby-plugin-intl'
import locations from '../../modules/locations'

type LogInProps = {
  title: string
  description: string
}

function handleBack() {
  if((window as any).routeUpdate) {
    window.history.back()
  } else {
    navigate(locations.proposals())
  }
}

function LogIn({ title, description }: LogInProps) {
  const [ account, accountState ] = useAuthContext()
  const l = useFormatMessage()
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })
  const imageUrl = "https://decentraland.org/images/decentraland.png"

  if(isMobile) {
    return <Container style={{textAlign: 'center'}}>
      <Head title={title} description={description} image={imageUrl} />
        <img src={imageUrl} style={{display: 'block', margin: 'auto', maxWidth: '50%'}}/>
        <Paragraph semiBold style={{fontSize: 'xx-large', marginBottom: '1rem'}}>
          {l(`mobile_login.exclamation`)}
        </Paragraph>
        <Paragraph semiBold style={{marginBottom: '5rem'}}>{l(`mobile_login.message`)}</Paragraph>
        <Button primary onClick={handleBack}>{l(`mobile_login.button`)}</Button>
    </Container>
  }

  return <Container>
    <Head title={title} description={description} image={imageUrl} />
    <SignIn isConnecting={accountState.selecting || accountState.loading} onConnect={() => accountState.select()} />
  </Container>
}

export default React.memo(LogIn)