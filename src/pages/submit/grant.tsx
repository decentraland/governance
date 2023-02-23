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
import ErrorMessage from '../../components/Error/ErrorMessage'
import GrantRequestCategorySection, {
  GrantRequestCategoryAssessment,
} from '../../components/GrantRequest/GrantRequestCategorySection'
import GrantRequestFinalConsentSection from '../../components/GrantRequest/GrantRequestFinalConsentSection'
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
import { NewGrantCategory } from '../../entities/Grant/types'
import { asNumber, userModifiedForm } from '../../entities/Proposal/utils'
import usePreventNavigation from '../../hooks/usePreventNavigation'
import loader from '../../modules/loader'
import locations from '../../modules/locations'

import './grant.css'
import './submit.css'

export type GrantRequest = {
  category: NewGrantCategory | null
} & GrantRequestFunding &
  GrantRequestGeneralInfo &
  GrantRequestCategoryAssessment

const initialState: GrantRequest = {
  category: null,
  ...INITIAL_GRANT_REQUEST_FUNDING_STATE,
  ...INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE,
}

export type GrantRequestValidationState = {
  fundingSectionValid: boolean
  generalInformationSectionValid: boolean
  categoryAssessmentSectionValid: boolean
  finalConsentSectionValid: boolean
}

const initialValidationState: GrantRequestValidationState = {
  fundingSectionValid: false,
  generalInformationSectionValid: false,
  categoryAssessmentSectionValid: false,
  finalConsentSectionValid: false,
}

const HAS_STICKY_NAVBAR_FEATURE = false // TODO: Implement this

export default function SubmitGrant() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [grantRequest, patchGrantRequest] = usePatchState<GrantRequest>(initialState)
  const [validationState, patchValidationState] = usePatchState<GrantRequestValidationState>(initialValidationState)
  const [isFormDisabled, setIsFormDisabled] = useState(false)
  const allSectionsValid = Object.values(validationState).every((prop) => prop)
  const isCategorySelected = grantRequest.category !== null
  const preventNavigation = useRef(false)
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)

  useEffect(() => {
    preventNavigation.current = userModifiedForm(grantRequest, initialState)
  }, [grantRequest])

  usePreventNavigation(!!preventNavigation)

  const submit = () => {
    if (allSectionsValid) {
      setIsFormDisabled(true)
      Promise.resolve()
        .then(async () => {
          const funding = asNumber(grantRequest.funding)
          return Governance.get().createProposalGrant({
            ...grantRequest,
            funding,
          })
        })
        .then((proposal) => {
          loader.proposals.set(proposal.id, proposal)
          navigate(locations.proposal(proposal.id, { new: 'true' }), { replace: true })
        })
        .catch((err) => {
          console.error(err, { ...err })
          setSubmitError(err.body?.error || err.message)
          setIsFormDisabled(false)
        })
    }
  }

  if (accountState.loading) {
    return <LoadingView />
  }

  if (!account) {
    return <LogIn title={t('page.submit_grant.title') || ''} description={t('page.submit_grant.description') || ''} />
  }

  return (
    <div>
      <Container className="ContentLayout__Container">
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
          <CategorySelector onCategoryClick={(value: NewGrantCategory) => patchGrantRequest({ category: value })} />
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

          {grantRequest.category && grantRequest.category !== NewGrantCategory.Platform && (
            <GrantRequestCategorySection
              category={grantRequest.category}
              onValidation={(data, sectionValid) => {
                patchGrantRequest({ ...data })
                patchValidationState({ categoryAssessmentSectionValid: sectionValid })
              }}
              isFormDisabled={isFormDisabled}
            />
          )}

          <GrantRequestFinalConsentSection
            category={grantRequest.category}
            onValidation={(sectionValid) => patchValidationState({ finalConsentSectionValid: sectionValid })}
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
      {!!submitError && (
        <Container className="GrantRequest__Error">
          <ContentSection>
            <ErrorMessage label={t('page.submit.error_label')} errorMessage={t(submitError) || submitError} />
          </ContentSection>
        </Container>
      )}
    </div>
  )
}
