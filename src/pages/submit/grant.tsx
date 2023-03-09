import React, { useCallback, useEffect, useRef, useState } from 'react'
import Helmet from 'react-helmet'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import usePatchState from 'decentraland-gatsby/dist/hooks/usePatchState'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import { Governance } from '../../clients/Governance'
import ErrorMessage from '../../components/Error/ErrorMessage'
import GrantRequestCategorySection from '../../components/GrantRequest/GrantRequestCategorySection'
import GrantRequestDueDiligenceSection, {
  INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE,
} from '../../components/GrantRequest/GrantRequestDueDiligenceSection'
import GrantRequestFinalConsentSection from '../../components/GrantRequest/GrantRequestFinalConsentSection'
import GrantRequestFundingSection, {
  INITIAL_GRANT_REQUEST_FUNDING_STATE,
} from '../../components/GrantRequest/GrantRequestFundingSection'
import GrantRequestGeneralInfoSection, {
  INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE,
} from '../../components/GrantRequest/GrantRequestGeneralInfoSection'
import GrantRequestTeamSection, {
  INITIAL_GRANT_REQUEST_TEAM_STATE,
} from '../../components/GrantRequest/GrantRequestTeamSection'
import CategorySelector from '../../components/Grants/CategorySelector'
import DecentralandLogo from '../../components/Icon/DecentralandLogo'
import { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import LogIn from '../../components/User/LogIn'
import { GrantRequest, NewGrantCategory } from '../../entities/Grant/types'
import { ProposalType } from '../../entities/Proposal/types'
import { asNumber, isGrantProposalSubmitEnabled, userModifiedForm } from '../../entities/Proposal/utils'
import { toNewGrantCategory } from '../../entities/QuarterCategoryBudget/utils'
import usePreventNavigation from '../../hooks/usePreventNavigation'
import loader from '../../modules/loader'
import locations from '../../modules/locations'

import './grant.css'
import './submit.css'

const initialState: GrantRequest = {
  category: null,
  ...INITIAL_GRANT_REQUEST_FUNDING_STATE,
  ...INITIAL_GRANT_REQUEST_GENERAL_INFO_STATE,
  ...INITIAL_GRANT_REQUEST_TEAM_STATE,
  ...INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE,
}

export type GrantRequestValidationState = {
  fundingSectionValid: boolean
  generalInformationSectionValid: boolean
  categoryAssessmentSectionValid: boolean
  finalConsentSectionValid: boolean
  dueDiligenceSectionValid: boolean
  teamSectionValid: boolean
}

const initialValidationState: GrantRequestValidationState = {
  fundingSectionValid: false,
  generalInformationSectionValid: false,
  categoryAssessmentSectionValid: false,
  finalConsentSectionValid: false,
  dueDiligenceSectionValid: false,
  teamSectionValid: false,
}

function parseStringsAsNumbers(grantRequest: GrantRequest) {
  grantRequest.funding = asNumber(grantRequest.funding)

  if (grantRequest.accelerator) {
    grantRequest.accelerator.investmentRecoveryTime = asNumber(grantRequest.accelerator.investmentRecoveryTime)
  }
  if (grantRequest.documentation) {
    grantRequest.documentation.totalPieces = asNumber(grantRequest.documentation?.totalPieces)
  }
  if (grantRequest.inWorldContent) {
    grantRequest.inWorldContent.totalPieces = asNumber(grantRequest.inWorldContent.totalPieces)
    grantRequest.inWorldContent.totalUsers = asNumber(grantRequest.inWorldContent.totalUsers)
  }
  if (grantRequest.socialMediaContent) {
    grantRequest.socialMediaContent.totalPieces = asNumber(grantRequest.socialMediaContent.totalPieces)
    grantRequest.socialMediaContent.totalPeopleImpact = asNumber(grantRequest.socialMediaContent.totalPeopleImpact)
  }
  if (grantRequest.sponsorship) {
    grantRequest.sponsorship.totalEvents = asNumber(grantRequest.sponsorship.totalEvents)
    grantRequest.sponsorship.totalAttendance = asNumber(grantRequest.sponsorship.totalAttendance)
  }
}

function handleCancel() {
  if ((window as any).routeUpdate) {
    window.history.back()
  } else {
    navigate(locations.submit())
  }
}

export default function SubmitGrant() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    let category: NewGrantCategory | null = null
    try {
      category = toNewGrantCategory(params.get('category'))
    } catch (error) {
      console.error(error)
    } finally {
      patchGrantRequest({ category })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [grantRequest, patchGrantRequest] = usePatchState<GrantRequest>(initialState)
  const [validationState, patchValidationState] = usePatchState<GrantRequestValidationState>(initialValidationState)
  const [isFormDisabled, setIsFormDisabled] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const allSectionsValid = Object.values(validationState).every((prop) => prop)
  const isCategorySelected = grantRequest.category !== null
  const preventNavigation = useRef(false)
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  let sectionNumber = 0

  const getSectionNumber = () => {
    sectionNumber++
    return sectionNumber
  }

  useEffect(() => {
    preventNavigation.current = userModifiedForm(grantRequest, initialState)
  }, [grantRequest])

  usePreventNavigation(!!preventNavigation)

  if (!isGrantProposalSubmitEnabled(Date.now())) {
    navigate('/submit')
  }

  const submit = useCallback(() => {
    if (allSectionsValid) {
      setIsFormDisabled(true)
      Promise.resolve()
        .then(async () => {
          parseStringsAsNumbers(grantRequest)
          return Governance.get().createProposalGrant(grantRequest)
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
  }, [allSectionsValid, grantRequest])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onScroll = function () {
        if (window.scrollY > 100) {
          setHasScrolled(true)
        }

        if (window.scrollY <= 100) {
          setHasScrolled(false)
        }
      }

      window.addEventListener('scroll', onScroll)

      return () => window.removeEventListener('scroll', onScroll)
    }
  }, [])

  if (accountState.loading) {
    return <LoadingView />
  }

  const title = t('page.submit_grant.title') || ''
  const description = t('page.submit_grant.description') || ''

  if (!account) {
    return <LogIn title={title} description={description} />
  }

  return (
    <div>
      <Head title={title} description={description} image="https://decentraland.org/images/decentraland.png" />
      <Helmet title={title} />
      <Container className="GrantRequest__Head">
        <div className="GrantRequest__Header">
          <DecentralandLogo
            className={TokenList.join(['GrantRequest__Logo', hasScrolled && 'GrantRequest__Logo--visible'])}
          />
          <h1 className="GrantRequest_HeaderTitle">{title}</h1>
        </div>
        <Button basic className="GrantRequest__CancelButton" onClick={handleCancel}>
          {t('page.submit_grant.cancel')}
        </Button>
      </Container>
      <Container className="GrantRequestSection__Container">
        <Markdown className="GrantRequest__HeaderDescription">{description}</Markdown>
      </Container>

      {!isCategorySelected && (
        <Container className="GrantRequestSection__Container">
          <CategorySelector
            onCategoryClick={(value: NewGrantCategory) => {
              patchGrantRequest({ category: value })
              patchValidationState({
                categoryAssessmentSectionValid: value === NewGrantCategory.Platform,
              })
              navigate(locations.submit(ProposalType.Grant, { category: value }), { replace: true })
            }}
          />
        </Container>
      )}

      {isCategorySelected && (
        <>
          <GrantRequestFundingSection
            grantCategory={grantRequest.category}
            onCategoryChange={() => {
              patchGrantRequest({ category: null })
              navigate(locations.submit(ProposalType.Grant), { replace: true })
            }}
            onValidation={(data, sectionValid) => {
              patchGrantRequest({ ...data })
              patchValidationState({ fundingSectionValid: sectionValid })
            }}
            isFormDisabled={isFormDisabled}
            sectionNumber={getSectionNumber()}
          />

          <GrantRequestGeneralInfoSection
            onValidation={(data, sectionValid) => {
              patchGrantRequest({ ...data })
              patchValidationState({ generalInformationSectionValid: sectionValid })
            }}
            isFormDisabled={isFormDisabled}
            sectionNumber={getSectionNumber()}
          />

          {grantRequest.category && (
            <GrantRequestCategorySection
              category={grantRequest.category}
              onValidation={(data, sectionValid) => {
                patchGrantRequest({ ...data })
                patchValidationState({ categoryAssessmentSectionValid: sectionValid })
              }}
              isFormDisabled={isFormDisabled}
              sectionNumber={getSectionNumber()}
            />
          )}

          <GrantRequestTeamSection
            funding={grantRequest.funding}
            onValidation={(data, sectionValid) => {
              patchGrantRequest({ ...data })
              patchValidationState({ teamSectionValid: sectionValid })
            }}
            sectionNumber={getSectionNumber()}
          />

          <GrantRequestDueDiligenceSection
            funding={grantRequest.funding}
            onValidation={(data, sectionValid) => {
              patchGrantRequest({ ...data })
              patchValidationState({ dueDiligenceSectionValid: sectionValid })
            }}
            sectionNumber={getSectionNumber()}
            projectDuration={grantRequest.projectDuration}
          />

          <GrantRequestFinalConsentSection
            category={grantRequest.category}
            onValidation={(sectionValid) => patchValidationState({ finalConsentSectionValid: sectionValid })}
            isFormDisabled={isFormDisabled}
            sectionNumber={getSectionNumber()}
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
