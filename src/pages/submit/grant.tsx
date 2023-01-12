import React, { useEffect, useRef } from 'react'
import Helmet from 'react-helmet'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import usePatchState from 'decentraland-gatsby/dist/hooks/usePatchState'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import GrantRequestSection from '../../components/GrantRequest/GrantRequestSection'
import DecentralandLogo from '../../components/Icon/DecentralandLogo'
import GrantRequestSectionFocused from '../../components/Icon/GrantRequestSection/GrantRequestSectionFocused'
import { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import LogIn from '../../components/User/LogIn'
import { GRANT_PROPOSAL_MAX_BUDGET, GRANT_PROPOSAL_MIN_BUDGET } from '../../entities/Grant/constants'
import { userModifiedForm } from '../../entities/Proposal/utils'
import usePreventNavigation from '../../hooks/usePreventNavigation'

import './grant.css'
import './submit.css'

export type GrantRequestFundingState = {
  funding: string | number
}

export const INITIAL_GRANT_REQUEST_FUNDING_STATE: GrantRequestFundingState = { funding: '' }

export type GrantRequestState = {
  title: string
} & GrantRequestFundingState

const initialState: GrantRequestState = {
  title: '',
  ...INITIAL_GRANT_REQUEST_FUNDING_STATE,
}

export const GrantRequestScheme = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'funding'],
  properties: {
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 80,
    },
    funding: {
      type: 'integer',
      minimum: Number(GRANT_PROPOSAL_MIN_BUDGET || 0),
      maximum: Number(GRANT_PROPOSAL_MAX_BUDGET || 0),
    },
  },
}

export default function SubmitGrant() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [grantRequest, patchGrantRequest] = usePatchState<GrantRequestState>(initialState)
  const preventNavigation = useRef(false)

  console.log('grantRequest', grantRequest)
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

      <GrantRequestSection
        sectionTitle={'Funding'}
        sectionNumber={1}
        onValid={(data: GrantRequestFundingState) => patchGrantRequest({ ...data })}
      />

      <Container className="ContentLayout__Container GrantRequestSection__Container">
        <div className="GrantRequestSection__Head">
          <div className="GrantRequestSection__Header">
            <GrantRequestSectionFocused sectionNumber={2} />
            <div className="GrantRequestSection__HeaderTitle">{'General Information'}</div>
            <div className="GrantRequestSection__HorizontalLine" />
          </div>
          <div className="GrantRequestSection__Content">
            <ContentSection className="GrantSize">
              <Label>{t('page.submit_grant.size_label')}</Label>
              <Paragraph tiny secondary className="details">
                {t('page.submit_grant.size_detail')}
              </Paragraph>
              <Field type="number" />
            </ContentSection>
          </div>
        </div>
      </Container>
    </div>
  )
}
