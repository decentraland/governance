import React, { useEffect, useRef } from 'react'
import Helmet from 'react-helmet'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import usePatchState from 'decentraland-gatsby/dist/hooks/usePatchState'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import GrantRequestFundingSection, {
  GrantRequestFundingState,
  INITIAL_GRANT_REQUEST_FUNDING_STATE,
} from '../../components/GrantRequest/GrantRequestFundingSection'
import GrantRequestGeneralInfoSection, {
  GrantRequestGeneralInfoState,
  INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE,
} from '../../components/GrantRequest/GrantRequestGeneralInfoSection'
import DecentralandLogo from '../../components/Icon/DecentralandLogo'
import { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import LogIn from '../../components/User/LogIn'
import { userModifiedForm } from '../../entities/Proposal/utils'
import usePreventNavigation from '../../hooks/usePreventNavigation'

import './grant.css'
import './submit.css'

export type GrantRequestState = {
  title: string
} & GrantRequestFundingState &
  GrantRequestGeneralInfoState

const initialState: GrantRequestState = {
  title: '',
  ...INITIAL_GRANT_REQUEST_FUNDING_STATE,
  ...INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE,
}

export default function SubmitGrant() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [grantRequest, patchGrantRequest] = usePatchState<GrantRequestState>(initialState)
  const preventNavigation = useRef(false)

  useEffect(() => {
    preventNavigation.current = userModifiedForm(grantRequest, initialState)
  }, [grantRequest])

  usePreventNavigation(!!preventNavigation)

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return <LogIn title={t('page.submit_grant.title') || ''} description={t('page.submit_grant.description') || ''} />
  }

  return (
    <div>
      <Container className="ContentLayout__Container" preventNavigation={preventNavigation.current}>
        <div className="GrantRequest__Head">
          <Head
            title={t('page.submit_grant.title') || ''}
            description={t('page.submit_grant.description') || ''}
            image="https://decentraland.org/images/decentraland.png"
          />
          <Helmet title={t('page.submit_grant.title') || ''} />
          <div className="GrantRequest__Header">
            <DecentralandLogo />
            <div>{t('page.submit_grant.title')}</div>
          </div>
          <Button basic className="cancel">
            {'Cancel'}
          </Button>
        </div>
      </Container>
      <Container className="ContentLayout__Container GrantRequestSection__Container">
        <ContentSection>
          <Markdown className="GrantRequest__HeaderDescription">
            {
              'Decentraland Grants allow MANA owned by the DAO to fund the creation of features or content beneficial to the Decentraland platform and its growth. Either individuals or teams may request grant funding through the DAO, and there are no constraints on the content or features that may be funded (within the bounds of Decentraland’s [Content Policy]()).'
            }
          </Markdown>
        </ContentSection>
      </Container>

      <GrantRequestFundingSection onValidation={(data: GrantRequestFundingState) => patchGrantRequest({ ...data })} />

      <GrantRequestGeneralInfoSection
        onValidation={(data: GrantRequestGeneralInfoState) => patchGrantRequest({ ...data })}
      />
    </div>
  )
}