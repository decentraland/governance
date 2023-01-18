import React, { useEffect, useRef, useState } from 'react'
import Helmet from 'react-helmet'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import usePatchState from 'decentraland-gatsby/dist/hooks/usePatchState'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import { Governance } from '../../clients/Governance'
import GrantRequestFundingSection, {
  GrantRequestFunding,
  INITIAL_GRANT_REQUEST_FUNDING_STATE,
} from '../../components/GrantRequest/GrantRequestFundingSection'
import GrantRequestGeneralInfoSection, {
  GrantRequestGeneralInfo,
  INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE,
} from '../../components/GrantRequest/GrantRequestGeneralInfoSection'
import CategorySelector from '../../components/Grants/CategorySelector'
import DecentralandLogo from '../../components/Icon/DecentralandLogo'
import { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import LogIn from '../../components/User/LogIn'
import { ProposalGrantCategory } from '../../entities/Proposal/types'
import { userModifiedForm } from '../../entities/Proposal/utils'
import usePreventNavigation from '../../hooks/usePreventNavigation'
import loader from '../../modules/loader'
import locations from '../../modules/locations'

import './grant.css'
import './submit.css'

export type GrantRequest = {
  title: string
  category: ProposalGrantCategory | null
} & GrantRequestFunding &
  GrantRequestGeneralInfo

const initialState: GrantRequest = {
  title: '',
  category: null,
  ...INITIAL_GRANT_REQUEST_FUNDING_STATE,
  ...INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE,
}

export type GrantRequestValidationState = {
  fundingSectionValid: boolean
  generalInformationSectionValid: boolean
}

const initialValidationState: GrantRequestValidationState = {
  fundingSectionValid: false,
  generalInformationSectionValid: false,
}

const HAS_STICKY_NAVBAR_FEATURE = false // TODO: Implement this

export default function SubmitGrant() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [grantRequest, patchGrantRequest] = usePatchState<GrantRequest>(initialState)
  const [validationState, patchValidationState] = usePatchState<GrantRequestValidationState>(initialValidationState)
  const preventNavigation = useRef(false)
  const [isFormDisabled, setIsFormDisabled] = useState(false)
  const allSectionsValid = Object.values(validationState).every((prop) => prop)

  const submit = () => {
    if (allSectionsValid) {
      setIsFormDisabled(true)
      Promise.resolve()
        .then(async () => {
          return Governance.get().createProposalGrant(grantRequest)
        })
        .then((proposal) => {
          loader.proposals.set(proposal.id, proposal)
          navigate(locations.proposal(proposal.id, { new: 'true' }), { replace: true })
        })
        .catch((err) => {
          console.error(err, { ...err })
          // editor.error({ '*': err.body?.error || err.message })
          setIsFormDisabled(false)
        })
    }
    setIsFormDisabled(false)
  }

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

  const isCategorySelected = grantRequest.category !== null

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
            {HAS_STICKY_NAVBAR_FEATURE && <DecentralandLogo />}
            <div>{t('page.submit_grant.title')}</div>
          </div>
          {HAS_STICKY_NAVBAR_FEATURE && <Button basic>{t('page.submit_grant.cancel')}</Button>}
        </div>
      </Container>
      <Container className="ContentLayout__Container GrantRequestSection__Container">
        <ContentSection>
          <Markdown className="GrantRequest__HeaderDescription">{t('page.submit_grant.description')}</Markdown>
        </ContentSection>
      </Container>

      {!isCategorySelected && (
        <Container className="ContentLayout__Container GrantRequestSection__Container">
          <CategorySelector
            onCategoryClick={(value: ProposalGrantCategory) => patchGrantRequest({ category: value })}
          />
        </Container>
      )}

      {isCategorySelected && (
        <>
          <GrantRequestFundingSection
            grantCategory={grantRequest.category}
            onCategoryChange={() => patchGrantRequest({ category: null })}
            onValidation={(data, sectionValid) => {
              patchGrantRequest({ ...data })
              patchValidationState({ fundingSectionValid: sectionValid })
            }}
            isFormDisabled={isFormDisabled}
          />

          <GrantRequestGeneralInfoSection
            onValidation={(data, sectionValid) => {
              patchGrantRequest({ ...data })
              patchValidationState({ generalInformationSectionValid: sectionValid })
            }}
            isFormDisabled={isFormDisabled}
          />

          <Container className="ContentLayout__Container">
            <ContentSection className="GrantRequestSection__Content">
              <div>
                <Button primary disabled={!allSectionsValid} loading={isFormDisabled} onClick={() => submit()}>
                  {t('page.submit.button_submit')}
                </Button>
              </div>
            </ContentSection>
          </Container>
        </>
      )}
    </div>
  )
}
