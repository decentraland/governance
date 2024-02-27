import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'
import { SignIn } from 'decentraland-ui/dist/components/SignIn/SignIn'

import { DCL_META_IMAGE_URL } from '../../constants'
import { useAuthContext } from '../../front/context/AuthProvider'
import useDclFeatureFlags from '../../hooks/useDclFeatureFlags'
import useFormatMessage from '../../hooks/useFormatMessage'
import { FeatureFlags } from '../../utils/features'
import locations, { navigate } from '../../utils/locations'
import Text from '../Common/Typography/Text'

import Head from './Head'
import './LogIn.css'

type Props = {
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

function LogIn({ title, description }: Props) {
  const [, accountState] = useAuthContext()
  const t = useFormatMessage()
  const isMobile = useMobileMediaQuery()
  const { isFeatureFlagEnabled } = useDclFeatureFlags()
  const isAuthDappEnabled = isFeatureFlagEnabled(FeatureFlags.AuthDapp)

  if (isMobile) {
    return (
      <Container className="LoginMobile__Container">
        <Head title={title} description={description} />
        <img src={DCL_META_IMAGE_URL} className="LoginMobile__Logo" />
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
      <Head title={title} description={description} />
      <SignIn
        isConnecting={accountState.selecting || accountState.loading}
        onConnect={isAuthDappEnabled ? accountState.authorize : accountState.select}
      />
    </Container>
  )
}

export default LogIn
