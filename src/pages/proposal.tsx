import { useEffect, useRef, useState } from 'react'

import { ErrorCode } from '@ethersproject/logger'
import { Web3Provider } from '@ethersproject/providers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Desktop, NotMobile, TabletAndBelow } from 'decentraland-ui/dist/components/Media/Media'

import { ErrorClient } from '../clients/ErrorClient'
import { Governance } from '../clients/Governance'
import { SnapshotApi } from '../clients/SnapshotApi'
import ProposalVPChart from '../components/Charts/ProposalVPChart'
import WiderContainer from '../components/Common/WiderContainer'
import FloatingBar from '../components/FloatingBar/FloatingBar'
import FloatingHeader from '../components/FloatingHeader/FloatingHeader'
import { Desktop1200 } from '../components/Layout/Desktop1200'
import Head from '../components/Layout/Head'
import LoadingView from '../components/Layout/LoadingView'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import NotFound from '../components/Layout/NotFound'
import BidSubmittedModal from '../components/Modal/BidSubmittedModal'
import BidVotingModal from '../components/Modal/BidVotingModal/BidVotingModal'
import ProposalSuccessModal from '../components/Modal/ProposalSuccessModal'
import TenderPublishedModal from '../components/Modal/TenderPublishedModal'
import UpdateSuccessModal from '../components/Modal/UpdateSuccessModal'
import { VoteRegisteredModal } from '../components/Modal/Votes/VoteRegisteredModal'
import { VotingModal } from '../components/Modal/Votes/VotingModal/VotingModal'
import ProposalComments from '../components/Proposal/Comments/ProposalComments'
import ProposalFooterPoi from '../components/Proposal/ProposalFooterPoi'
import ProposalHeaderPoi from '../components/Proposal/ProposalHeaderPoi'
import ProposalHero from '../components/Proposal/ProposalHero'
import ProposalSidebar from '../components/Proposal/ProposalSidebar'
import VotingRationaleSection from '../components/Proposal/Rationale/VotingRationaleSection'
import SurveyResults from '../components/Proposal/SentimentSurvey/SurveyResults'
import ProposalUpdates from '../components/Proposal/Update/ProposalUpdates'
import AuthorDetails from '../components/Proposal/View/AuthorDetails'
import BiddingAndTendering from '../components/Proposal/View/BiddingAndTendering'
import ProposalBudget from '../components/Proposal/View/Budget/ProposalBudget'
import BidProposalView from '../components/Proposal/View/Categories/BidProposalView'
import GrantProposalView from '../components/Proposal/View/Categories/GrantProposalView'
import CompetingBiddingAndTendering from '../components/Proposal/View/CompetingBiddingAndTendering'
import GovernanceProcess from '../components/Proposal/View/GovernanceProcess'
import ProposalDetailSection from '../components/Proposal/View/ProposalDetailSection'
import ProposalImagesPreview from '../components/Proposal/View/ProposalImagesPreview'
import ProposalMarkdown from '../components/Proposal/View/ProposalMarkdown'
import { OldGrantCategory } from '../entities/Grant/types'
import { ProposalAttributes, ProposalStatus, ProposalType } from '../entities/Proposal/types'
import {
  isBiddingAndTenderingProposal,
  isGovernanceProcessProposal,
  isProjectProposal,
} from '../entities/Proposal/utils'
import { Survey } from '../entities/SurveyTopic/types'
import { SurveyEncoder } from '../entities/SurveyTopic/utils'
import { isProposalStatusWithUpdates } from '../entities/Updates/utils'
import { SelectedVoteChoice } from '../entities/Votes/types'
import { useAuthContext } from '../front/context/AuthProvider'
import { DEFAULT_QUERY_STALE_TIME } from '../hooks/constants'
import useAsyncTask from '../hooks/useAsyncTask'
import useBudgetWithContestants from '../hooks/useBudgetWithContestants'
import useFormatMessage from '../hooks/useFormatMessage'
import useIsProposalCoAuthor from '../hooks/useIsProposalCoAuthor'
import useIsProposalOwner from '../hooks/useIsProposalOwner'
import useProposal from '../hooks/useProposal'
import useProposalChoices from '../hooks/useProposalChoices'
import useProposalUpdates from '../hooks/useProposalUpdates'
import useProposalVotes from '../hooks/useProposalVotes'
import { PROPOSAL_CACHED_VOTES_QUERY_KEY } from '../hooks/useProposalsCachedVotes'
import useSurvey from '../hooks/useSurvey'
import useURLSearchParams from '../hooks/useURLSearchParams'
import useVoteReason from '../hooks/useVoteReason'
import { ErrorCategory } from '../utils/errorCategories'
import locations, { navigate } from '../utils/locations'
import { isUnderMaintenance } from '../utils/maintenance'

import './proposal.css'

const EMPTY_VOTE_CHOICE_SELECTION: SelectedVoteChoice = { choice: undefined, choiceIndex: undefined }
const MAX_ERRORS_BEFORE_SNAPSHOT_REDIRECT = 3
const SECONDS_FOR_VOTING_RETRY = 5

export type ProposalPageState = {
  changingVote: boolean
  confirmSubscription: boolean
  confirmDeletion: boolean
  confirmStatusUpdate: ProposalStatus | false
  showProposalSuccessModal: boolean
  showTenderPublishedModal: boolean
  showBidSubmittedModal: boolean
  showUpdateSuccessModal: boolean
  showVotingModal: boolean
  showBidVotingModal: boolean
  showVotingError: boolean
  showSnapshotRedirect: boolean
  showResults: boolean
  retryTimer: number
  selectedChoice: SelectedVoteChoice
}

function isLegacyGrantCategory(category: string) {
  return Object.values(OldGrantCategory).includes(category as OldGrantCategory)
}

function formatDescription(description: string) {
  const value = description.trim()
  const position = value.indexOf(`\n\n`)

  return position > 0 ? value.slice(0, position).trim() : value
}

function getProposalView(proposal: ProposalAttributes | null) {
  switch (proposal?.type) {
    case ProposalType.Grant:
      return <GrantProposalView config={proposal.configuration} />
    case ProposalType.Bid:
      return <BidProposalView config={proposal.configuration} />
    default:
      return <ProposalMarkdown text={proposal?.description || ''} />
  }
}

export default function ProposalPage() {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const [proposalPageState, updatePageState] = useState<ProposalPageState>({
    changingVote: false,
    confirmSubscription: false,
    confirmDeletion: false,
    confirmStatusUpdate: false,
    showProposalSuccessModal: false,
    showTenderPublishedModal: false,
    showBidSubmittedModal: false,
    showUpdateSuccessModal: false,
    showVotingModal: false,
    showBidVotingModal: false,
    showVotingError: false,
    showSnapshotRedirect: false,
    showResults: false,
    retryTimer: SECONDS_FOR_VOTING_RETRY,
    selectedChoice: EMPTY_VOTE_CHOICE_SELECTION,
  })
  const [account, { provider }] = useAuthContext()
  const [errorCounter, setErrorCounter] = useState(0)
  const { proposal, isLoadingProposal, isErrorOnProposal } = useProposal(params.get('id'))
  const { isCoauthor } = useIsProposalCoAuthor(proposal)
  const { isOwner } = useIsProposalOwner(proposal)
  const { votes, segmentedVotes, isLoadingVotes, reloadVotes } = useProposalVotes(proposal?.id)
  const { highQualityVotes } = segmentedVotes || {}
  const choices = useProposalChoices(proposal)

  const subscriptionsQueryKey = `proposalSubscriptions#${proposal?.id || ''}`
  const { data: subscriptions, isLoading: isSubscriptionsLoading } = useQuery({
    queryKey: [subscriptionsQueryKey],
    queryFn: () => {
      if (proposal) {
        return Governance.get().getSubscriptions(proposal.id)
      }
      return []
    },
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })
  const { budgetWithContestants, isLoadingBudgetWithContestants } = useBudgetWithContestants(proposal?.id)

  const { publicUpdates, pendingUpdates, nextUpdate, currentUpdate, refetchUpdates } = useProposalUpdates(proposal?.id)
  const showProposalUpdates =
    publicUpdates && isProposalStatusWithUpdates(proposal?.status) && isProjectProposal(proposal?.type)

  const { surveyTopics, isLoadingSurveyTopics, voteWithSurvey, showSurveyResults } = useSurvey(
    proposal,
    votes,
    isLoadingVotes
  )

  const { shouldGiveReason, totalVpOnProposal } = useVoteReason(proposal)

  const [isFloatingHeaderVisible, setIsFloatingHeaderVisible] = useState<boolean>(true)

  const commentsSectionRef = useRef<HTMLDivElement | null>(null)
  const reactionsSectionRef = useRef<HTMLDivElement | null>(null)
  const heroSectionRef = useRef<HTMLDivElement | null>(null)
  const votingSectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setIsFloatingHeaderVisible(false)
    if (!isLoadingProposal && typeof window !== 'undefined') {
      const handleScroll = () => {
        if (!!heroSectionRef.current && !!window) {
          const { top: heroSectionTop, height: heroSectionHeight } = heroSectionRef.current.getBoundingClientRect()
          setIsFloatingHeaderVisible(heroSectionTop + heroSectionHeight / 2 < 0)
        }
      }

      window.addEventListener('scroll', handleScroll)
      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isLoadingProposal])

  const [castingVote, castVote] = useAsyncTask(
    async (selectedChoice: SelectedVoteChoice, survey?: Survey, reason?: string) => {
      if (proposal && account && provider && votes && selectedChoice.choiceIndex) {
        const web3Provider = new Web3Provider(provider)
        const [listedAccount] = await web3Provider.listAccounts()
        try {
          await SnapshotApi.get().castVote({
            account: web3Provider,
            address: listedAccount,
            proposalSnapshotId: proposal.snapshot_id,
            choiceNumber: selectedChoice.choiceIndex!,
            metadata: SurveyEncoder.encode(survey),
            reason,
          })
          try {
            await Governance.get().createVoteEvent(proposal.id, proposal.title, selectedChoice.choice!)
          } catch (e) {
            // do nothing
          }
          updatePageState((prevState) => ({
            ...prevState,
            changingVote: false,
            showVotingModal: false,
            showBidVotingModal: false,
            showVotingError: false,
            confirmSubscription: !votes![account!],
          }))
          await reloadVotes()
          await queryClient.invalidateQueries({ queryKey: [PROPOSAL_CACHED_VOTES_QUERY_KEY] })
        } catch (error) {
          ErrorClient.report('Unable to vote', {
            error,
            address: listedAccount,
            proposal: proposal.id,
            category: ErrorCategory.Voting,
          })
          /* eslint-disable @typescript-eslint/no-explicit-any */
          if ((error as any).code === ErrorCode.ACTION_REJECTED) {
            updatePageState((prevState) => ({
              ...prevState,
              changingVote: false,
            }))
          } else {
            updatePageState((prevState) => ({
              ...prevState,
              changingVote: false,
              showVotingError: true,
              showSnapshotRedirect: errorCounter + 1 >= MAX_ERRORS_BEFORE_SNAPSHOT_REDIRECT,
            }))
            setErrorCounter((prev) => prev + 1)
          }
        }
      }
    },
    [proposal, account, provider, votes, proposalPageState.selectedChoice]
  )
  const queryClient = useQueryClient()

  const { mutate: updateSubscription, isLoading: isUpdatingSubscription } = useMutation({
    mutationFn: async (subscribe: boolean) => {
      if (proposal) {
        if (subscribe) {
          const newSubscription = await Governance.get().subscribe(proposal.id)
          return [...(subscriptions ?? []), newSubscription]
        } else {
          await Governance.get().unsubscribe(proposal.id)
          return (subscriptions ?? []).filter((subscription) => subscription.proposal_id !== proposal.id)
        }
      }
    },
    onSuccess: (updatedSubscriptions) => {
      updatePageState((prevState) => ({ ...prevState, confirmSubscription: false }))
      if (!proposal) return
      queryClient.setQueryData([subscriptionsQueryKey], updatedSubscriptions)
    },
  })

  useEffect(() => {
    updatePageState((prevState) => ({
      ...prevState,
      showProposalSuccessModal: params.get('new') === 'true',
      showTenderPublishedModal: params.get('pending') === 'true',
      showBidSubmittedModal: params.get('bid') === 'true',
    }))
  }, [params])

  useEffect(() => {
    const isNewUpdate = params.get('newUpdate') === 'true'
    if (isNewUpdate) {
      refetchUpdates()
    }
    updatePageState((prevState) => ({ ...prevState, showUpdateSuccessModal: isNewUpdate }))
  }, [params, refetchUpdates])

  useEffect(() => {
    if (proposalPageState.showVotingError) {
      const timer = setTimeout(() => {
        updatePageState((prevState) => ({ ...prevState, retryTimer: proposalPageState.retryTimer - 1 }))
      }, 1000)

      if (proposalPageState.retryTimer <= 0) {
        updatePageState((prevState) => ({ ...prevState, retryTimer: SECONDS_FOR_VOTING_RETRY, showVotingError: false }))
      }
      return () => clearTimeout(timer)
    }
  }, [proposalPageState.showVotingError, proposalPageState.retryTimer, updatePageState])

  const closeProposalSuccessModal = () => {
    updatePageState((prevState) => ({ ...prevState, showProposalSuccessModal: false }))
    navigate(locations.proposal(proposal!.id), { replace: true })
  }

  const closeUpdateSuccessModal = () => {
    updatePageState((prevState) => ({ ...prevState, showUpdateSuccessModal: false }))
    navigate(locations.proposal(proposal!.id), { replace: true })
  }

  if (isErrorOnProposal) {
    return (
      <WiderContainer className="ProposalDetailPage">
        <NotFound />
      </WiderContainer>
    )
  }

  if (isUnderMaintenance()) {
    return (
      <MaintenanceLayout title={t('page.proposal_detail.title')} description={t('page.proposal_detail.description')} />
    )
  }

  const showImagesPreview =
    !isLoadingProposal && proposal?.type === ProposalType.LinkedWearables && !!proposal.configuration.image_previews
  const showProposalBudget =
    proposal?.type === ProposalType.Grant &&
    !isLegacyGrantCategory(proposal.configuration.category) &&
    !isLoadingBudgetWithContestants
  const showCompetingBiddingAndTendering =
    proposal &&
    proposal?.status === ProposalStatus.Active &&
    (proposal?.type === ProposalType.Tender || proposal?.type === ProposalType.Bid)

  const showVotesChart =
    proposalPageState.showResults && !isLoadingProposal && proposal?.type !== ProposalType.Poll && highQualityVotes

  const showAuthorDetails =
    proposal?.user && proposal?.type === ProposalType.Grant && proposal?.status === ProposalStatus.Active

  const title = proposal?.title || t('page.proposal_detail.title') || ''
  const description =
    (proposal?.description && formatDescription(proposal.description)) || t('page.proposal_detail.description') || ''

  if (isLoadingProposal) {
    return (
      <>
        <Head title={title} description={description} />
        <Navigation activeTab={NavigationTab.Proposals} />
        <LoadingView withNavigation />
      </>
    )
  }

  return (
    <>
      <Head
        title={title}
        description={description}
        links={[{ rel: 'canonical', href: locations.proposal(proposal?.id || '') }]}
      />
      <Navigation activeTab={NavigationTab.Proposals} />
      <NotMobile>{proposal && <FloatingHeader isVisible={isFloatingHeaderVisible} proposal={proposal} />}</NotMobile>
      <WiderContainer className="ProposalDetailPage">
        <ProposalHero proposal={proposal} ref={heroSectionRef} />
        {proposal && (
          <Desktop1200>
            <div className="ProposalDetail__Left">
              <ProposalDetailSection proposal={proposal} className="DetailsSection__StickyTop" />
            </div>
          </Desktop1200>
        )}
        <div className="ProposalDetailPage__Description">
          {showProposalBudget && <ProposalBudget proposal={proposal} budget={budgetWithContestants} />}
          {showCompetingBiddingAndTendering && <CompetingBiddingAndTendering proposal={proposal} />}
          {proposal?.type === ProposalType.POI && <ProposalHeaderPoi configuration={proposal?.configuration} />}
          {showImagesPreview && <ProposalImagesPreview imageUrls={proposal.configuration.image_previews} />}
          <div className="ProposalDetailPage__Body">{getProposalView(proposal)}</div>
          {proposal?.type === ProposalType.POI && <ProposalFooterPoi configuration={proposal.configuration} />}
          {proposal && isBiddingAndTenderingProposal(proposal?.type) && <BiddingAndTendering proposal={proposal} />}
          {showAuthorDetails && <AuthorDetails address={proposal?.user} />}
          {showProposalUpdates && (
            <ProposalUpdates
              proposal={proposal}
              updates={publicUpdates}
              onUpdateDeleted={refetchUpdates}
              isCoauthor={isCoauthor}
            />
          )}
          <Desktop>
            {showVotesChart && (
              <ProposalVPChart
                requiredToPass={proposal?.required_to_pass}
                voteMap={highQualityVotes}
                startTimestamp={proposal?.start_at.getTime()}
                endTimestamp={proposal?.finish_at.getTime()}
              />
            )}
            {proposal && isGovernanceProcessProposal(proposal.type) && (
              <GovernanceProcess proposalType={proposal.type} />
            )}
            {showSurveyResults && (
              <SurveyResults
                votes={highQualityVotes ?? null}
                surveyTopics={surveyTopics}
                isLoadingSurveyTopics={isLoadingSurveyTopics}
                ref={reactionsSectionRef}
              />
            )}
            <VotingRationaleSection votes={highQualityVotes} choices={choices} />
            <ProposalComments proposal={proposal} ref={commentsSectionRef} />
          </Desktop>
          <TabletAndBelow>
            {proposal && isGovernanceProcessProposal(proposal.type) && (
              <GovernanceProcess proposalType={proposal.type} />
            )}
          </TabletAndBelow>
          {proposal && (
            <FloatingBar
              isActiveProposal={proposal?.status === ProposalStatus.Active}
              isLoadingProposal={isLoadingProposal}
              proposalHasReactions={!!showSurveyResults}
              proposalId={proposal?.id}
              discourseTopicId={proposal?.discourse_topic_id}
              discourseTopicSlug={proposal?.discourse_topic_slug}
              reactionsSectionRef={reactionsSectionRef}
              commentsSectionRef={commentsSectionRef}
              votingSectionRef={votingSectionRef}
            />
          )}
        </div>
        <div className="ProposalDetailActions">
          <ProposalSidebar
            proposal={proposal}
            proposalLoading={isLoadingProposal}
            proposalPageState={proposalPageState}
            updatePageState={updatePageState}
            pendingUpdates={pendingUpdates}
            currentUpdate={currentUpdate}
            nextUpdate={nextUpdate}
            castingVote={castingVote}
            castVote={castVote}
            voteWithSurvey={voteWithSurvey}
            voteOnBid={proposal?.type === ProposalType.Bid && !proposalPageState.changingVote}
            subscribing={isUpdatingSubscription}
            subscribe={updateSubscription}
            subscriptions={subscriptions ?? []}
            subscriptionsLoading={isSubscriptionsLoading}
            isCoauthor={isCoauthor}
            isOwner={isOwner}
            shouldGiveReason={shouldGiveReason}
            votingSectionRef={votingSectionRef}
          />
        </div>
        <TabletAndBelow>
          {showVotesChart && (
            <ProposalVPChart
              requiredToPass={proposal?.required_to_pass}
              voteMap={highQualityVotes}
              startTimestamp={proposal?.start_at.getTime()}
              endTimestamp={proposal?.finish_at.getTime()}
            />
          )}
          {showSurveyResults && (
            <SurveyResults
              votes={highQualityVotes ?? null}
              surveyTopics={surveyTopics}
              isLoadingSurveyTopics={isLoadingSurveyTopics}
              ref={reactionsSectionRef}
            />
          )}
          <VotingRationaleSection votes={highQualityVotes} choices={choices} />
          <ProposalComments proposal={proposal} ref={commentsSectionRef} />
        </TabletAndBelow>
      </WiderContainer>

      {proposal && (voteWithSurvey || shouldGiveReason) && (
        <VotingModal
          proposal={proposal}
          surveyTopics={surveyTopics}
          isLoadingSurveyTopics={isLoadingSurveyTopics}
          onClose={() => {
            setErrorCounter(0)
            updatePageState((prevState) => ({ ...prevState, showVotingModal: false, showSnapshotRedirect: false }))
          }}
          onCastVote={castVote}
          castingVote={castingVote}
          proposalPageState={proposalPageState}
          totalVpOnProposal={totalVpOnProposal}
          shouldGiveReason={shouldGiveReason}
          voteWithSurvey={voteWithSurvey}
        />
      )}
      {proposal && proposal.type === ProposalType.Bid && (
        <BidVotingModal
          proposal={proposal}
          onCastVote={castVote}
          castingVote={castingVote}
          linkedTenderId={proposal.configuration.linked_proposal_id}
          proposalPageState={proposalPageState}
          onClose={() => {
            setErrorCounter(0)
            updatePageState((prevState) => ({ ...prevState, showBidVotingModal: false, showSnapshotRedirect: false }))
          }}
        />
      )}

      <VoteRegisteredModal
        loading={isUpdatingSubscription}
        open={proposalPageState.confirmSubscription}
        onClickAccept={() => updateSubscription(true)}
        onClose={() => updatePageState((prevState) => ({ ...prevState, confirmSubscription: false }))}
      />

      {proposal && (
        <>
          <ProposalSuccessModal
            open={proposalPageState.showProposalSuccessModal}
            onDismiss={closeProposalSuccessModal}
            onClose={closeProposalSuccessModal}
            proposal={proposal}
            loading={isLoadingProposal}
          />
          {proposal.type === ProposalType.Tender && (
            <>
              <TenderPublishedModal
                open={proposalPageState.showTenderPublishedModal}
                onDismiss={closeProposalSuccessModal}
                onClose={closeProposalSuccessModal}
                proposal={proposal}
                loading={isLoadingProposal}
              />
              <BidSubmittedModal
                open={proposalPageState.showBidSubmittedModal}
                onDismiss={closeProposalSuccessModal}
                onClose={closeProposalSuccessModal}
                proposal={proposal}
                loading={isLoadingProposal}
              />
            </>
          )}
        </>
      )}
      <UpdateSuccessModal
        open={proposalPageState.showUpdateSuccessModal}
        onDismiss={closeUpdateSuccessModal}
        onClose={closeUpdateSuccessModal}
        proposalId={proposal?.id}
        updateId={publicUpdates?.[0]?.id}
        loading={isLoadingProposal}
      />
    </>
  )
}
