import { useCallback, useEffect, useRef, useState } from 'react'

import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import { Governance } from '../../clients/Governance'
import BidRequestFinalConsentSection from '../../components/BidRequest/BidRequestFinalConsentSection'
import BidRequestFundingSection, {
  INITIAL_BID_REQUEST_FUNDING_STATE,
} from '../../components/BidRequest/BidRequestFundingSection'
import BidRequestGeneralInfoSection, {
  INITIAL_BID_REQUEST_GENERAL_INFO_STATE,
} from '../../components/BidRequest/BidRequestGeneralInfoSection'
import CardSubtitle from '../../components/BidRequest/CardSubtitle'
import Markdown from '../../components/Common/Typography/Markdown'
import Text from '../../components/Common/Typography/Text'
import ErrorMessage from '../../components/Error/ErrorMessage'
import GrantRequestDueDiligenceSection, {
  INITIAL_GRANT_REQUEST_DUE_DILIGENCE_STATE,
} from '../../components/GrantRequest/GrantRequestDueDiligenceSection'
import { GrantRequestSectionCard } from '../../components/GrantRequest/GrantRequestSectionCard'
import GrantRequestTeamSection, {
  INITIAL_GRANT_REQUEST_TEAM_STATE,
} from '../../components/GrantRequest/GrantRequestTeamSection'
import DecentralandLogo from '../../components/Icon/DecentralandLogo'
import OpenExternalLink from '../../components/Icon/OpenExternalLink'
import { ContentSection } from '../../components/Layout/ContentLayout'
import Head from '../../components/Layout/Head'
import LoadingView from '../../components/Layout/LoadingView'
import LogIn from '../../components/Layout/LogIn'
import { BID_MIN_PROJECT_DURATION } from '../../entities/Bid/constants'
import { BidRequest } from '../../entities/Bid/types'
import { ProposalType } from '../../entities/Proposal/types'
import { asNumber, userModifiedForm } from '../../entities/Proposal/utils'
import useBidsInfoOnTender from '../../hooks/useBidsInfoOnTender'
import useFormatMessage from '../../hooks/useFormatMessage'
import usePreventNavigation from '../../hooks/usePreventNavigation'
import useProjectRequestSectionNumber from '../../hooks/useProjectRequestSectionNumber'
import useProposal from '../../hooks/useProposal'
import useProposalOutcome from '../../hooks/useProposalOutcome'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import useUserBid from '../../hooks/useUserBid'
import locations, { navigate } from '../../utils/locations'

import './bid.css'
import './grant.css'
import './submit.css'

const initialState: Partial<BidRequest> = {
  linked_proposal_id: '',
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
  const funding = asNumber(bidRequest.funding)
  return { ...bidRequest, funding }
}

// TODO: This function is repeated in other files...
function handleCancel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).routeUpdate) {
    window.history.back()
  } else {
    navigate(locations.submit())
  }
}

export default function SubmitBid() {
  const t = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [bidRequest, patchBidRequest] = useState(initialState)
  const [validationState, setValidationState] = useState<BidRequestValidationState>(initialValidationState)
  const [isFormDisabled, setIsFormDisabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const allSectionsValid = Object.values(validationState).every((prop) => prop)
  const preventNavigation = useRef(false)
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { getSectionNumber } = useProjectRequestSectionNumber()
  const params = useURLSearchParams()
  const linkedProposalId = params.get('linked_proposal_id')
  const { proposal: tenderProposal } = useProposal(linkedProposalId)
  const { proposal: pitchProposal } = useProposal(tenderProposal?.configuration.linked_proposal_id)
  const { winnerVotingPower: winnerTenderVotingPower, isLoadingOutcome: isLoadingTenderOutcome } = useProposalOutcome(
    tenderProposal?.snapshot_id || '',
    tenderProposal?.configuration.choices
  )
  const { winnerVotingPower: winnerPitchVotingPower, isLoadingOutcome: isLoadingPitchOutcome } = useProposalOutcome(
    pitchProposal?.snapshot_id || '',
    pitchProposal?.configuration.choices
  )
  const userPlacedBid = useUserBid(linkedProposalId)
  const { isSubmissionWindowFinished } = useBidsInfoOnTender(linkedProposalId)

  useEffect(() => {
    if (userPlacedBid !== null || isSubmissionWindowFinished) {
      setIsFormDisabled(true)
    }
  }, [userPlacedBid, isSubmissionWindowFinished])

  useEffect(() => {
    preventNavigation.current = userModifiedForm(bidRequest, initialState)
  }, [bidRequest])

  useEffect(() => {
    if (linkedProposalId) {
      patchBidRequest((prevState) => ({ ...prevState, linked_proposal_id: linkedProposalId }))
    }
  }, [linkedProposalId, patchBidRequest])

  usePreventNavigation(!!preventNavigation)

  const submit = useCallback(async () => {
    if (allSectionsValid) {
      setIsFormDisabled(true)
      setIsLoading(true)
      const bidRequestParsed = parseStringsAsNumbers(bidRequest as BidRequest)

      try {
        await Governance.get().createProposalBid(bidRequestParsed)
        navigate(locations.proposal(bidRequestParsed.linked_proposal_id, { bid: 'true' }))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setSubmitError(error.body?.error || error.message)
        setIsLoading(false)
        setIsFormDisabled(false)
      }
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
      setValidationState((prevState) => ({ ...prevState, fundingSectionValid: sectionValid }))
    },
    [patchBidRequest, setValidationState]
  )

  const handleGeneralInfoSectionValidation = useCallback(
    (data, sectionValid) => {
      patchBidRequest((prevState) => ({ ...prevState, ...data }))
      setValidationState((prevState) => ({ ...prevState, generalInformationSectionValid: sectionValid }))
    },
    [patchBidRequest, setValidationState]
  )

  if (accountState.loading) {
    return <LoadingView />
  }

  const title = t('page.submit_bid.title')
  const description = t('page.submit_bid.description')

  if (!account) {
    return <LogIn title={title} description={description} />
  }

  return (
    <div>
      <Head
        title={title}
        description={description}
        links={[{ rel: 'canonical', href: locations.submit(ProposalType.Bid) }]}
      />
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
      <Container className="BidRequest__ParentProposals">
        <div className="ProjectRequestSection__Row">
          {pitchProposal && (
            <GrantRequestSectionCard
              href={locations.proposal(pitchProposal.id)}
              title={t('page.submit_bid.parent_pitch')}
              content={pitchProposal.title}
              subtitle={
                <CardSubtitle
                  votingPower={winnerPitchVotingPower}
                  finishAt={pitchProposal.finish_at}
                  isLoading={isLoadingPitchOutcome}
                />
              }
              helper={<OpenExternalLink color="var(--black-400)" />}
            />
          )}
          {tenderProposal && (
            <GrantRequestSectionCard
              href={locations.proposal(tenderProposal.id)}
              title={t('page.submit_bid.parent_tender')}
              content={tenderProposal.title}
              subtitle={
                <CardSubtitle
                  votingPower={winnerTenderVotingPower}
                  finishAt={tenderProposal.finish_at}
                  isLoading={isLoadingTenderOutcome}
                />
              }
              helper={<OpenExternalLink color="var(--black-400)" />}
            />
          )}
        </div>
      </Container>
      <BidRequestFundingSection
        onValidation={handleFundingSectionValidation}
        isFormDisabled={isFormDisabled}
        sectionNumber={getSectionNumber()}
      />

      <BidRequestGeneralInfoSection
        onValidation={handleGeneralInfoSectionValidation}
        isFormDisabled={isFormDisabled}
        sectionNumber={getSectionNumber()}
      />

      <GrantRequestTeamSection
        onValidation={(data, sectionValid) => {
          patchBidRequest((prevState) => ({ ...prevState, ...data }))
          setValidationState((prevState) => ({ ...prevState, teamSectionValid: sectionValid }))
        }}
        sectionNumber={getSectionNumber()}
        isDisabled={isFormDisabled}
      />

      <GrantRequestDueDiligenceSection
        funding={Number(bidRequest.funding)}
        onValidation={(data, sectionValid) => {
          patchBidRequest((prevState) => ({ ...prevState, ...data }))
          setValidationState((prevState) => ({ ...prevState, dueDiligenceSectionValid: sectionValid }))
        }}
        sectionNumber={getSectionNumber()}
        projectDuration={bidRequest.projectDuration || BID_MIN_PROJECT_DURATION}
        isDisabled={isFormDisabled}
      />

      <BidRequestFinalConsentSection
        onValidation={(sectionValid) =>
          setValidationState((prevState) => ({ ...prevState, finalConsentSectionValid: sectionValid }))
        }
        isFormDisabled={isFormDisabled}
        sectionNumber={getSectionNumber()}
      />

      <Container className="ContentLayout__Container">
        <ContentSection className="ProjectRequestSection__Content">
          <div>
            <Button primary disabled={!allSectionsValid || isFormDisabled} loading={isLoading} onClick={submit}>
              {t('page.submit.button_submit')}
            </Button>
          </div>
          {(userPlacedBid || isSubmissionWindowFinished) && (
            <Text size="lg" color="primary">
              {userPlacedBid && t('error.bid.user_has_placed_bid')}
              {isSubmissionWindowFinished && t('error.bid.submission_finished')}
            </Text>
          )}
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
