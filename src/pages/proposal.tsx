import { useEffect, useMemo, useRef, useState } from 'react'

import { ErrorCode } from '@ethersproject/logger'
import { Web3Provider } from '@ethersproject/providers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import usePatchState from 'decentraland-gatsby/dist/hooks/usePatchState'
import { NotMobile, useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { ErrorClient } from '../clients/ErrorClient'
import { Governance } from '../clients/Governance'
import { SnapshotApi } from '../clients/SnapshotApi'
import ProposalVPChart from '../components/Charts/ProposalVPChart'
import WiderContainer from '../components/Common/WiderContainer'
import FloatingBar from '../components/FloatingBar/FloatingBar'
import FloatingHeader from '../components/FloatingHeader/FloatingHeader'
import { Desktop1200 } from '../components/Layout/Desktop1200'
import LoadingView from '../components/Layout/LoadingView'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import BidSubmittedModal from '../components/Modal/BidSubmittedModal'
import BidVotingModal from '../components/Modal/BidVotingModal/BidVotingModal'
import { DeleteProposalModal } from '../components/Modal/DeleteProposalModal/DeleteProposalModal'
import ProposalSuccessModal from '../components/Modal/ProposalSuccessModal'
import TenderPublishedModal from '../components/Modal/TenderPublishedModal'
import { UpdateProposalStatusModal } from '../components/Modal/UpdateProposalStatusModal/UpdateProposalStatusModal'
import UpdateSuccessModal from '../components/Modal/UpdateSuccessModal'
import { VoteRegisteredModal } from '../components/Modal/Votes/VoteRegisteredModal'
import VotesListModal from '../components/Modal/Votes/VotesList'
import { VotingModal } from '../components/Modal/Votes/VotingModal/VotingModal'
import ProposalComments from '../components/Proposal/Comments/ProposalComments'
import ProposalFooterPoi from '../components/Proposal/ProposalFooterPoi'
import ProposalHeaderPoi from '../components/Proposal/ProposalHeaderPoi'
import ProposalHero from '../components/Proposal/ProposalHero'
import ProposalSidebar from '../components/Proposal/ProposalSidebar'
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
import { isBiddingAndTenderingProposal, isGovernanceProcessProposal } from '../entities/Proposal/utils'
import { Survey } from '../entities/SurveyTopic/types'
import { SurveyEncoder } from '../entities/SurveyTopic/utils'
import { isProposalStatusWithUpdates } from '../entities/Updates/utils'
import { SelectedVoteChoice } from '../entities/Votes/types'
import { DEFAULT_QUERY_STALE_TIME } from '../hooks/constants'
import useAsyncTask from '../hooks/useAsyncTask'
import useBudgetWithContestants from '../hooks/useBudgetWithContestants'
import useFormatMessage from '../hooks/useFormatMessage'
import useIsDAOCommittee from '../hooks/useIsDAOCommittee'
import useIsProposalCoAuthor from '../hooks/useIsProposalCoAuthor'
import useIsProposalOwner from '../hooks/useIsProposalOwner'
import useProposal from '../hooks/useProposal'
import useProposalUpdates from '../hooks/useProposalUpdates'
import useProposalVotes from '../hooks/useProposalVotes'
import useSurvey from '../hooks/useSurvey'
import useURLSearchParams from '../hooks/useURLSearchParams'
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
  showVotesList: boolean
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
  const isMobile = useMobileMediaQuery()
  const [proposalPageState, updatePageState] = usePatchState<ProposalPageState>({
    changingVote: false,
    confirmSubscription: false,
    confirmDeletion: false,
    confirmStatusUpdate: false,
    showVotesList: false,
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
  const { isDAOCommittee } = useIsDAOCommittee(account)
  const [errorCounter, setErrorCounter] = useState(0)
  const updatePageStateRef = useRef(updatePageState)
  const { proposal, isLoadingProposal, isErrorOnProposal, proposalKey } = useProposal(params.get('id'))
  const { isCoauthor } = useIsProposalCoAuthor(proposal)
  const { isOwner } = useIsProposalOwner(proposal)
  const { votes, segmentedVotes, isLoadingVotes, reloadVotes } = useProposalVotes(proposal?.id)
  const { highQualityVotes, lowQualityVotes } = segmentedVotes || {}

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
    publicUpdates && isProposalStatusWithUpdates(proposal?.status) && proposal?.type === ProposalType.Grant

  const { surveyTopics, isLoadingSurveyTopics, voteWithSurvey, showSurveyResults } = useSurvey(
    proposal,
    votes,
    isLoadingVotes,
    isMobile
  )

  const [isFloatingHeaderVisible, setIsFloatingHeaderVisible] = useState<boolean>(true)
  const [isBarVisible, setIsBarVisible] = useState<boolean>(true)
  const commentsSectionRef = useRef<HTMLDivElement | null>(null)
  const reactionsSectionRef = useRef<HTMLDivElement | null>(null)
  const heroSectionRef = useRef<HTMLDivElement | null>(null)
  const scrollToReactions = () => {
    if (reactionsSectionRef.current) {
      reactionsSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }
  const scrollToComments = () => {
    if (commentsSectionRef.current) {
      commentsSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    setIsBarVisible(true)
    setIsFloatingHeaderVisible(false)
    if (!isLoadingProposal && typeof window !== 'undefined') {
      const handleScroll = () => {
        const hideBarSectionRef = reactionsSectionRef.current || commentsSectionRef.current
        if (!!hideBarSectionRef && !!window) {
          const hideBarSectionTop = hideBarSectionRef.getBoundingClientRect().top
          setIsBarVisible(hideBarSectionTop > window.innerHeight)
        }

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
    async (selectedChoice: SelectedVoteChoice, survey?: Survey) => {
      if (proposal && account && provider && votes && selectedChoice.choiceIndex) {
        const web3Provider = new Web3Provider(provider)
        const [listedAccount] = await web3Provider.listAccounts()
        try {
          await SnapshotApi.get().castVote(
            web3Provider,
            listedAccount,
            proposal.snapshot_id,
            selectedChoice.choiceIndex!,
            SurveyEncoder.encode(survey)
          )
          updatePageState({
            changingVote: false,
            showVotingModal: false,
            showBidVotingModal: false,
            showVotingError: false,
            confirmSubscription: !votes![account!],
          })
          await reloadVotes()
        } catch (error) {
          ErrorClient.report('Unable to vote', {
            error,
            address: listedAccount,
            proposal: proposal.id,
            category: ErrorCategory.Voting,
          })
          if ((error as any).code === ErrorCode.ACTION_REJECTED) {
            updatePageState({
              changingVote: false,
            })
          } else {
            updatePageState({
              changingVote: false,
              showVotingError: true,
              showSnapshotRedirect: errorCounter + 1 >= MAX_ERRORS_BEFORE_SNAPSHOT_REDIRECT,
            })
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
      updatePageState({ confirmSubscription: false })
      if (!proposal) return
      queryClient.setQueryData([subscriptionsQueryKey], updatedSubscriptions)
    },
  })

  const [deleting, deleteProposal] = useAsyncTask(async () => {
    if (proposal && account && (proposal.user === account || isDAOCommittee)) {
      await Governance.get().deleteProposal(proposal.id)
      navigate(locations.proposals())
    }
  }, [proposal, account, isDAOCommittee])

  useEffect(() => {
    updatePageStateRef.current({
      showProposalSuccessModal: params.get('new') === 'true',
      showTenderPublishedModal: params.get('pending') === 'true',
      showBidSubmittedModal: params.get('bid') === 'true',
    })
  }, [params])

  useEffect(() => {
    const isNewUpdate = params.get('newUpdate') === 'true'
    if (isNewUpdate) {
      refetchUpdates()
    }
    updatePageStateRef.current({ showUpdateSuccessModal: isNewUpdate })
  }, [params, refetchUpdates])

  useEffect(() => {
    if (proposalPageState.showVotingError) {
      const timer = setTimeout(() => {
        updatePageState({ retryTimer: proposalPageState.retryTimer - 1 })
      }, 1000)

      if (proposalPageState.retryTimer <= 0) {
        updatePageState({ retryTimer: SECONDS_FOR_VOTING_RETRY, showVotingError: false })
      }
      return () => clearTimeout(timer)
    }
  }, [proposalPageState.showVotingError, proposalPageState.retryTimer, updatePageState])

  const closeProposalSuccessModal = () => {
    updatePageState({ showProposalSuccessModal: false })
    navigate(locations.proposal(proposal!.id), { replace: true })
  }

  const closeUpdateSuccessModal = () => {
    updatePageState({ showUpdateSuccessModal: false })
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
  const image = 'https://decentraland.org/images/decentraland.png'

  if (isLoadingProposal) {
    return (
      <>
        <Head title={title} description={description} image={image} />
        <Navigation activeTab={NavigationTab.Proposals} />
        <LoadingView withNavigation />
      </>
    )
  }

  return (
    <>
      <Head title={title} description={description} image={image} />
      <Navigation activeTab={NavigationTab.Proposals} />
      <NotMobile>{proposal && <FloatingHeader isVisible={isFloatingHeaderVisible} proposal={proposal} />}</NotMobile>
      <WiderContainer className={'ProposalDetailPage'}>
        <ProposalHero proposal={proposal} ref={heroSectionRef} />
        {proposal && (
          <Desktop1200>
            <div className={'ProposalDetail__Left'}>
              <ProposalDetailSection proposal={proposal} className={'DetailsSection__StickyTop'} />
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
          {proposal && isGovernanceProcessProposal(proposal.type) && <GovernanceProcess proposalType={proposal.type} />}
          {showProposalUpdates && (
            <ProposalUpdates
              proposal={proposal}
              updates={publicUpdates}
              onUpdateDeleted={refetchUpdates}
              isCoauthor={isCoauthor}
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
          {showAuthorDetails && <AuthorDetails address={proposal?.user} />}
          {showVotesChart && (
            <ProposalVPChart
              requiredToPass={proposal?.required_to_pass}
              voteMap={highQualityVotes}
              startTimestamp={proposal?.start_at.getTime()}
              endTimestamp={proposal?.finish_at.getTime()}
            />
          )}
          <ProposalComments proposal={proposal} ref={commentsSectionRef} />
          {proposal && (
            <FloatingBar
              isVisible={isBarVisible}
              proposalHasReactions={!!showSurveyResults}
              scrollToReactions={scrollToReactions}
              scrollToComments={scrollToComments}
              proposalId={proposal?.id}
              discourseTopicId={proposal?.discourse_topic_id}
              discourseTopicSlug={proposal?.discourse_topic_slug}
            />
          )}
        </div>
        <div className="ProposalDetailActions">
          <ProposalSidebar
            proposal={proposal}
            proposalLoading={isLoadingProposal}
            deleting={deleting}
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
            highQualityVotes={highQualityVotes}
            votes={votes}
            votesLoading={isLoadingVotes}
            isCoauthor={isCoauthor}
            isOwner={isOwner}
          />
        </div>
      </WiderContainer>

      {proposal && voteWithSurvey && (
        <VotingModal
          proposal={proposal}
          surveyTopics={surveyTopics}
          isLoadingSurveyTopics={isLoadingSurveyTopics}
          onClose={() => {
            setErrorCounter(0)
            updatePageState({ showVotingModal: false, showSnapshotRedirect: false })
          }}
          onCastVote={castVote}
          castingVote={castingVote}
          proposalPageState={proposalPageState}
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
            updatePageState({ showBidVotingModal: false, showSnapshotRedirect: false })
          }}
        />
      )}
      <VotesListModal
        open={proposalPageState.showVotesList}
        proposal={proposal}
        highQualityVotes={highQualityVotes}
        lowQualityVotes={lowQualityVotes}
        onClose={() => updatePageState({ showVotesList: false })}
      />
      <VoteRegisteredModal
        loading={isUpdatingSubscription}
        open={proposalPageState.confirmSubscription}
        onClickAccept={() => updateSubscription(true)}
        onClose={() => updatePageState({ confirmSubscription: false })}
      />
      <DeleteProposalModal
        loading={deleting}
        open={proposalPageState.confirmDeletion}
        onClickAccept={() => deleteProposal()}
        onClose={() => updatePageState({ confirmDeletion: false })}
      />
      <UpdateProposalStatusModal
        open={!!proposalPageState.confirmStatusUpdate}
        proposal={proposal}
        isDAOCommittee={isDAOCommittee}
        status={proposalPageState.confirmStatusUpdate || null}
        proposalKey={proposalKey}
        onClose={() => updatePageState({ confirmStatusUpdate: false })}
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
