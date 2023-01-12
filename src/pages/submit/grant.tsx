import React from 'react'
import Helmet from 'react-helmet'

import Label from 'decentraland-gatsby/dist/components/Form/Label'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Field } from 'decentraland-ui/dist/components/Field/Field'

import DecentralandLogo from '../../components/Icon/DecentralandLogo'
import RequestGrantSectionFocused from '../../components/Icon/RequestGrantSectionFocused'
import RequestGrantSectionOk from '../../components/Icon/RequestGrantSectionOk'
import { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import LogIn from '../../components/User/LogIn'
import { VALID_CATEGORIES, newProposalGrantScheme } from '../../entities/Proposal/types'

import './grant.css'
import './submit.css'

type GrantState = {
  title: string
  abstract: string
  category: string | null
  size: string | number
  beneficiary: string
  email: string
  description: string
  specification: string
  personnel: string
  roadmap: string
  coAuthors?: string[]
}

const initialState: GrantState = {
  title: '',
  abstract: '',
  category: null,
  size: '',
  beneficiary: '',
  email: '',
  description: '',
  specification: '',
  personnel: '',
  roadmap: '',
}

const categories = VALID_CATEGORIES.map((category) => ({ key: category, text: category, value: category }))

const schema = newProposalGrantScheme.properties
const edit = (state: GrantState, props: Partial<GrantState>) => {
  return {
    ...state,
    ...props,
  }
}

export default function SubmitGrant() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return <LogIn title={t('page.submit_grant.title') || ''} description={t('page.submit_grant.description') || ''} />
  }

  return (
    <div>
      <Container className="ContentLayout__Container">
        <div className="RequestGrant__Head">
          <Head
            title={t('page.submit_grant.title') || ''}
            description={t('page.submit_grant.description') || ''}
            image="https://decentraland.org/images/decentraland.png"
          />
          <Helmet title={t('page.submit_grant.title') || ''} />
          <div className="RequestGrant__Header">
            <DecentralandLogo />
            <div>{t('page.submit_grant.title')}</div>
          </div>
          <Button basic className="cancel">
            {'Cancel'}
          </Button>
        </div>
      </Container>
      <Container className="ContentLayout__Container RequestGrantSection__Container">
        <ContentSection>
          <Markdown className="RequestGrant__HeaderDescription">
            {
              'Decentraland Grants allow MANA owned by the DAO to fund the creation of features or content beneficial to the Decentraland platform and its growth. Either individuals or teams may request grant funding through the DAO, and there are no constraints on the content or features that may be funded (within the bounds of Decentraland’s [Content Policy]()).'
            }
          </Markdown>
        </ContentSection>
      </Container>

      <Container className="ContentLayout__Container RequestGrantSection__Container">
        <div className="RequestGrantSection__Head">
          <div className="RequestGrantSection__Header">
            <RequestGrantSectionOk className={'RequestGrantSection__FixedSizeIcon'} />
            <div className="RequestGrantSection__HeaderTitle">{'Funding'}</div>
            <div className="RequestGrantSection__HorizontalLine" />
          </div>
          <div className="RequestGrantSection__Content">
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

      <Container className="ContentLayout__Container RequestGrantSection__Container">
        <div className="RequestGrantSection__Head">
          <div className="RequestGrantSection__Header">
            <RequestGrantSectionFocused className={'RequestGrantSection__FixedSizeIcon'} />
            <div className="RequestGrantSection__HeaderTitle">{'General Information'}</div>
            <div className="RequestGrantSection__HorizontalLine" />
          </div>
          <div className="RequestGrantSection__Content">
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
