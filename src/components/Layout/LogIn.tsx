import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { DappsFeatureFlags } from 'decentraland-gatsby/dist/context/FeatureFlag/types'
import useFeatureFlagContext from 'decentraland-gatsby/dist/context/FeatureFlag/useFeatureFlagContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'
import { SignIn } from 'decentraland-ui/dist/components/SignIn/SignIn'
import { StaticImage } from 'gatsby-plugin-image'

import useFormatMessage from '../../hooks/useFormatMessage'
import locations, { navigate } from '../../utils/locations'
import Text from '../Common/Typography/Text'

import './LogIn.css'

type LogInProps = {
  title: string
  description: string
}

function handleBack() {
  if ((window as { routeUpdate?: unknown }).routeUpdate) {
    window.history.back()
  } else {
    navigate(locations.proposals())
  }
}

const IMAGE_URL = 'https://decentraland.org/images/decentraland.png'

function LogIn({ title, description }: LogInProps) {
  const [, accountState] = useAuthContext()
  const t = useFormatMessage()
  const [ff] = useFeatureFlagContext()
  const isMobile = useMobileMediaQuery()
  const isAuthDappEnabled = ff.enabled(DappsFeatureFlags.AuthDappEnabled)

  if (isMobile) {
    return (
      <Container className="LoginMobile__Container">
        <Head title={title} description={description} image={IMAGE_URL} />
        <StaticImage placeholder="blurred" alt="" src={IMAGE_URL} className="LoginMobile__Logo" />
        <Text weight="semi-bold" className="LoginMobile__Title">
          {t(`mobile_login.exclamation`)}
        </Text>
        <Text size="lg" weight="semi-bold" className="LoginMobile__Message">
          {t(`mobile_login.message`)}
        </Text>
        <Button primary onClick={handleBack}>
          {t(`mobile_login.button`)}
        </Button>
      </Container>
    )
  }

  return (
    <Container>
      <Head title={title} description={description} image={IMAGE_URL} />
      <SignIn
        isConnecting={accountState.selecting || accountState.loading}
        onConnect={isAuthDappEnabled ? accountState.authorize : accountState.select}
      />
    </Container>
  )
}

export default LogIn
