import React, { useCallback, useEffect, useRef, useState } from 'react'
import Helmet from 'react-helmet'

import classNames from 'classnames'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import usePatchState from 'decentraland-gatsby/dist/hooks/usePatchState'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import BidRequestFinalConsentSection from '../../components/BidRequest/BidRequestFinalConsentSection'
import BidRequestFundingSection, {
  INITIAL_BID_REQUEST_FUNDING_STATE,
} from '../../components/BidRequest/BidRequestFundingSection'
import BidRequestGeneralInfoSection, {
  INITIAL_BID_REQUEST_GENERAL_INFO_STATE,
} from '../../components/BidRequest/BidRequestGeneralInfoSection'
import Markdown from '../../components/Common/Typography/Markdown'
import ErrorMessage from '../../components/Error/ErrorMessage'
import GrantRequestDueDiligenceSection, {
  INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE,
} from '../../components/GrantRequest/GrantRequestDueDiligenceSection'
import GrantRequestTeamSection, {
  INITIAL_GRANT_REQUEST_TEAM_STATE,
} from '../../components/GrantRequest/GrantRequestTeamSection'
import DecentralandLogo from '../../components/Icon/DecentralandLogo'
import { ContentSection } from '../../components/Layout/ContentLayout'
import LoadingView from '../../components/Layout/LoadingView'
import LogIn from '../../components/User/LogIn'
import { BidRequest } from '../../entities/Bid/types'
import { asNumber, userModifiedForm } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import usePreventNavigation from '../../hooks/usePreventNavigation'
import locations, { navigate } from '../../utils/locations'

import './grant.css'
import './submit.css'

const initialState: BidRequest = {
  ...INITIAL_BID_REQUEST_FUNDING_STATE,
  ...INITIAL_BID_REQUEST_GENERAL_INFO_STATE,
  ...INITIAL_GRANT_REQUEST_TEAM_STATE,
  ...INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE,
}

export type BidRequestValidationState = {
  fundingSectionValid: boolean
  generalInformationSectionValid: boolean
  teamSectionValid: boolean
  dueDiligenceSectionValid: boolean
  finalConsentSectionValid: boolean
}

const initialValidationState: BidRequestValidationState = {
  fundingSectionValid: false,
  generalInformationSectionValid: false,
  teamSectionValid: false,
  dueDiligenceSectionValid: false,
  finalConsentSectionValid: false,
}

function parseStringsAsNumbers(bidRequest: BidRequest) {
  bidRequest.funding = asNumber(bidRequest.funding)
}

function handleCancel() {
  if ((window as any).routeUpdate) {
    window.history.back()
  } else {
    navigate(locations.submit())
  }
}

export default function SubmitBid() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [bidRequest, patchBidRequest] = useState<BidRequest>(initialState)
  const [validationState, patchValidationState] = usePatchState<BidRequestValidationState>(initialValidationState)
  const [isFormDisabled, setIsFormDisabled] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const allSectionsValid = Object.values(validationState).every((prop) => prop)
  const preventNavigation = useRef(false)
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  let sectionNumber = 0

  const getSectionNumber = () => {
    sectionNumber++
    return sectionNumber
  }

  useEffect(() => {
    preventNavigation.current = userModifiedForm(bidRequest, initialState)
  }, [bidRequest])

  usePreventNavigation(!!preventNavigation)

  const submit = useCallback(() => {
    if (allSectionsValid) {
      setIsFormDisabled(true)
      Promise.resolve()
        .then(async () => {
          parseStringsAsNumbers(bidRequest)
          console.log('bidRequest', bidRequest)

          return { id: 'todo' } // Send to backend and return proposal
        })
        .then((proposal) => {
          navigate(locations.proposal(proposal.id, { new: 'true' }), { replace: true })
        })
        .catch((err) => {
          console.error(err, { ...err })
          setSubmitError(err.body?.error || err.message)
          setIsFormDisabled(false)
        })
    }
  }, [allSectionsValid, bidRequest])

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

  const handleFundingSectionValidation = useCallback(
    (data, sectionValid) => {
      patchBidRequest((prevState) => ({ ...prevState, ...data }))
      patchValidationState({ fundingSectionValid: sectionValid })
    },
    [patchBidRequest, patchValidationState]
  )

  if (accountState.loading) {
    return <LoadingView />
  }

  const title = t('page.submit_bid.title') || ''
  const description = t('page.submit_bid.description') || ''

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
            className={classNames('GrantRequest__Logo', hasScrolled && 'GrantRequest__Logo--visible')}
          />
          <h1 className="GrantRequest_HeaderTitle">{title}</h1>
        </div>
        <Button basic className="GrantRequest__CancelButton" onClick={handleCancel}>
          {t('page.submit_bid.cancel')}
        </Button>
      </Container>
      <Container className="ProjectRequestSection__Container">
        <Markdown componentsClassNames={{ p: 'GrantRequest__HeaderDescription' }}>{description}</Markdown>
      </Container>

      <BidRequestFundingSection
        onValidation={handleFundingSectionValidation}
        isFormDisabled={isFormDisabled}
        sectionNumber={getSectionNumber()}
      />

      <BidRequestGeneralInfoSection
        onValidation={(data, sectionValid) => {
          patchBidRequest((prevState) => ({ ...prevState, ...data }))
          patchValidationState({ generalInformationSectionValid: sectionValid })
        }}
        isFormDisabled={isFormDisabled}
        sectionNumber={getSectionNumber()}
      />

      <GrantRequestTeamSection
        funding={bidRequest.funding}
        onValidation={(data, sectionValid) => {
          patchBidRequest((prevState) => ({ ...prevState, ...data }))
          patchValidationState({ teamSectionValid: sectionValid })
        }}
        sectionNumber={getSectionNumber()}
      />

      <GrantRequestDueDiligenceSection
        funding={bidRequest.funding}
        onValidation={(data, sectionValid) => {
          patchBidRequest((prevState) => ({ ...prevState, ...data }))
          patchValidationState({ dueDiligenceSectionValid: sectionValid })
        }}
        sectionNumber={getSectionNumber()}
        projectDuration={bidRequest.projectDuration}
      />

      <BidRequestFinalConsentSection
        onValidation={(sectionValid) => patchValidationState({ finalConsentSectionValid: sectionValid })}
        isFormDisabled={isFormDisabled}
        sectionNumber={getSectionNumber()}
      />

      <Container className="ContentLayout__Container">
        <ContentSection className="ProjectRequestSection__Content">
          <div>
            <Button primary disabled={!allSectionsValid} loading={isFormDisabled} onClick={submit}>
              {t('page.submit.button_submit')}
            </Button>
          </div>
        </ContentSection>
      </Container>

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
