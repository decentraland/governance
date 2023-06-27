import React, { useEffect, useMemo, useRef, useState } from 'react'

import { ErrorCode } from '@ethersproject/logger'
import { Web3Provider } from '@ethersproject/providers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import usePatchState from 'decentraland-gatsby/dist/hooks/usePatchState'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Desktop } from 'decentraland-ui/dist/components/Media/Media'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { ErrorClient } from '../clients/ErrorClient'
import { Governance } from '../clients/Governance'
import { SnapshotApi } from '../clients/SnapshotApi'
import CategoryPill from '../components/Category/CategoryPill'
import Markdown from '../components/Common/Markdown/Markdown'
import ContentLayout, { ContentSection } from '../components/Layout/ContentLayout'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import { DeleteProposalModal } from '../components/Modal/DeleteProposalModal/DeleteProposalModal'
import ProposalSuccessModal from '../components/Modal/ProposalSuccessModal'
import { UpdateProposalStatusModal } from '../components/Modal/UpdateProposalStatusModal/UpdateProposalStatusModal'
import UpdateSuccessModal from '../components/Modal/UpdateSuccessModal'
import { VoteRegisteredModal } from '../components/Modal/Votes/VoteRegisteredModal'
import VotesListModal from '../components/Modal/Votes/VotesList'
import { VotingModal } from '../components/Modal/Votes/VotingModal/VotingModal'
import ProposalComments from '../components/Proposal/Comments/ProposalComments'
import ProposalFooterPoi from '../components/Proposal/ProposalFooterPoi'
import ProposalHeaderPoi from '../components/Proposal/ProposalHeaderPoi'
import ProposalSidebar from '../components/Proposal/ProposalSidebar'
import SurveyResults from '../components/Proposal/SentimentSurvey/SurveyResults'
import ProposalUpdates from '../components/Proposal/Update/ProposalUpdates'
import BiddingAndTenderingProcess from '../components/Proposal/View/BiddingAndTenderingProcess'
import ProposalBudget from '../components/Proposal/View/Budget/ProposalBudget'
import GrantProposalView from '../components/Proposal/View/Categories/GrantProposalView'
import CompetingTenders from '../components/Proposal/View/CompetingTenders'
import GovernanceProcess from '../components/Proposal/View/GovernanceProcess'
import ProposalImagesPreview from '../components/Proposal/View/ProposalImagesPreview'
import TenderProposals from '../components/Proposal/View/TenderProposals'
import StatusPill from '../components/Status/StatusPill'
import { VOTES_VP_THRESHOLD } from '../constants'
import { OldGrantCategory } from '../entities/Grant/types'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { isBiddingAndTenderingProposal, isGovernanceProcessProposal } from '../entities/Proposal/utils'
import { Survey } from '../entities/SurveyTopic/types'
import { SurveyEncoder } from '../entities/SurveyTopic/utils'
import { isProposalStatusWithUpdates } from '../entities/Updates/utils'
import { SelectedVoteChoice, Vote } from '../entities/Votes/types'
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
import useSurveyTopics from '../hooks/useSurveyTopics'
import { useTenderProposals } from '../hooks/useTenderProposals'
import useURLSearchParams from '../hooks/useURLSearchParams'
import locations, { navigate } from '../utils/locations'
import { isUnderMaintenance } from '../utils/maintenance'

import './proposal.css'

const EMPTY_VOTE_CHOICE_SELECTION: SelectedVoteChoice = { choice: undefined, choiceIndex: undefined }
const MAX_ERRORS_BEFORE_SNAPSHOT_REDIRECT = 3
const SECONDS_FOR_VOTING_RETRY = 5
const SURVEY_TOPICS_FEATURE_LAUNCH = new Date(2023, 3, 5, 0, 0)
export const PROPOSAL_DESCRIPTION_MARKDOWN_STYLES = {
  h2: 'ProposalDetailPage__Description__Title',
  h3: 'ProposalDetailPage__Description__SubTitle',
  p: 'ProposalDetailPage__Description__Text',
  li: 'ProposalDetailPage__Description__ListItem',
}

export type ProposalPageState = {
  changingVote: boolean
  confirmSubscription: boolean
  confirmDeletion: boolean
  confirmStatusUpdate: ProposalStatus | false
  showVotesList: boolean
  showProposalSuccessModal: boolean
  showUpdateSuccessModal: boolean
  showVotingModal: boolean
  showVotingError: boolean
  showSnapshotRedirect: boolean
  retryTimer: number
  selectedChoice: SelectedVoteChoice
}

type VoteSegmentation = {
  highQualityVotes: Record<string, Vote>
  lowQualityVotes: Record<string, Vote>
}

type UpdateProps = {
  status: ProposalStatus
  vesting_contract: string | null
  enactingTx: string | null
  description: string
}

function getVoteSegmentation(votes: Record<string, Vote> | null | undefined): VoteSegmentation {
  const highQualityVotes: Record<string, Vote> = {}
  const lowQualityVotes: Record<string, Vote> = {}

  if (votes) {
    Object.entries(votes).forEach(([address, vote]) => {
      if (vote.vp > VOTES_VP_THRESHOLD) {
        highQualityVotes[address] = vote
      } else {
        lowQualityVotes[address] = vote
      }
    })
  }

  return {
    highQualityVotes,
    lowQualityVotes,
  }
}

function isLegacyGrantCategory(category: string) {
  return Object.values(OldGrantCategory).includes(category as OldGrantCategory)
}

function formatDescription(description: string) {
  const value = description.trim()
  const position = value.indexOf(`\n\n`)

  return position > 0 ? value.slice(0, position).trim() : value
}

export default function ProposalPage() {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const [proposalPageState, updatePageState] = usePatchState<ProposalPageState>({
    changingVote: false,
    confirmSubscription: false,
    confirmDeletion: false,
    confirmStatusUpdate: false,
    showVotesList: false,
    showProposalSuccessModal: false,
    showUpdateSuccessModal: false,
    showVotingModal: false,
    showVotingError: false,
    showSnapshotRedirect: false,
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
  const { votes, isLoadingVotes, reloadVotes } = useProposalVotes(proposal?.id)
  const { highQualityVotes, lowQualityVotes } = useMemo(() => getVoteSegmentation(votes), [votes])
  const { surveyTopics, isLoadingSurveyTopics } = useSurveyTopics(proposal?.id)
  const subscriptionsQueryKey = `subscriptions#${proposal?.id || ''}`
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
  const { tenderProposals } = useTenderProposals(proposal?.id, proposal?.type)

  const { publicUpdates, pendingUpdates, nextUpdate, currentUpdate, refetchUpdates } = useProposalUpdates(proposal?.id)
  const showProposalUpdates =
    publicUpdates && isProposalStatusWithUpdates(proposal?.status) && proposal?.type === ProposalType.Grant

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
            showVotingError: false,
            confirmSubscription: !votes![account!],
          })
          reloadVotes()
        } catch (err) {
          ErrorClient.report('Unable to vote: ', err)
          if ((err as any).code === ErrorCode.ACTION_REJECTED) {
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

  const { mutate: updateProposal, isLoading: isUpdating } = useMutation({
    mutationFn: async (updateProps: UpdateProps) => {
      const { status, vesting_contract, enactingTx, description } = updateProps
      if (proposal && isDAOCommittee) {
        const updateProposal = await Governance.get().updateProposalStatus(
          proposal.id,
          status,
          vesting_contract,
          enactingTx,
          description
        )
        updatePageState({ confirmStatusUpdate: false })
        return updateProposal
      }
    },
    onSuccess: (proposal) => {
      if (proposal) {
        queryClient.setQueryData([proposalKey], proposal)
      }
    },
  })

  const [deleting, deleteProposal] = useAsyncTask(async () => {
    if (proposal && account && (proposal.user === account || isDAOCommittee)) {
      await Governance.get().deleteProposal(proposal.id)
      navigate(locations.proposals())
    }
  }, [proposal, account, isDAOCommittee])

  useEffect(() => {
    updatePageStateRef.current({ showProposalSuccessModal: params.get('new') === 'true' })
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

  const voteWithSurvey =
    !isLoadingSurveyTopics &&
    !!surveyTopics &&
    surveyTopics.length > 0 &&
    !!proposal &&
    proposal.created_at > SURVEY_TOPICS_FEATURE_LAUNCH

  if (isErrorOnProposal) {
    return (
      <ContentLayout className="ProposalDetailPage">
        <NotFound />
      </ContentLayout>
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
  const showTenderProposals =
    proposal?.type === ProposalType.Pitch && tenderProposals?.data && tenderProposals?.total > 0
  const showCompetingTenders = !!proposal && proposal.type === ProposalType.Tender

  return (
    <>
      <Head
        title={proposal?.title || t('page.proposal_detail.title') || ''}
        description={
          (proposal?.description && formatDescription(proposal.description)) ||
          t('page.proposal_detail.description') ||
          ''
        }
        image="https://decentraland.org/images/decentraland.png"
      />
      <ContentLayout className="ProposalDetailPage">
        <ContentSection>
          <Header size="huge">{proposal?.title || ''} &nbsp;</Header>
          <Loader active={!proposal} />
          <div className="ProposalDetailPage__Labels">
            {proposal && <StatusPill isLink status={proposal.status} />}
            {proposal && <CategoryPill isLink proposalType={proposal.type} />}
          </div>
        </ContentSection>
        <Grid stackable>
          <Grid.Row>
            <Grid.Column tablet="12" className="ProposalDetailPage__Description">
              <Loader active={isLoadingProposal} />
              {showProposalBudget && <ProposalBudget proposal={proposal} budget={budgetWithContestants} />}
              {showCompetingTenders && <CompetingTenders proposal={proposal} />}
              {proposal?.type === ProposalType.POI && <ProposalHeaderPoi configuration={proposal?.configuration} />}
              {showImagesPreview && <ProposalImagesPreview imageUrls={proposal.configuration.image_previews} />}
              <div className="ProposalDetailPage__Body">
                {proposal?.type === ProposalType.Grant ? (
                  <GrantProposalView config={proposal.configuration} />
                ) : (
                  <Markdown componentsClassNames={PROPOSAL_DESCRIPTION_MARKDOWN_STYLES}>
                    {proposal?.description || ''}
                  </Markdown>
                )}
              </div>
              {proposal?.type === ProposalType.POI && <ProposalFooterPoi configuration={proposal.configuration} />}
              {showTenderProposals && <TenderProposals proposals={tenderProposals.data} />}
              {proposal && isBiddingAndTenderingProposal(proposal.type) && (
                <BiddingAndTenderingProcess proposal={proposal} tenderProposalsTotal={tenderProposals?.total} />
              )}
              {proposal && isGovernanceProcessProposal(proposal.type) && (
                <GovernanceProcess proposalType={proposal.type} />
              )}
              {showProposalUpdates && (
                <ProposalUpdates
                  proposal={proposal}
                  updates={publicUpdates}
                  onUpdateDeleted={refetchUpdates}
                  isCoauthor={isCoauthor}
                />
              )}
              {proposal && voteWithSurvey && (
                <Desktop>
                  <SurveyResults
                    votes={votes}
                    isLoadingVotes={isLoadingVotes}
                    surveyTopics={surveyTopics}
                    isLoadingSurveyTopics={isLoadingSurveyTopics}
                  />
                </Desktop>
              )}
              <ProposalComments proposal={proposal} />
            </Grid.Column>

            <Grid.Column tablet="4" className="ProposalDetailActions">
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
                updatingStatus={isUpdating}
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
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </ContentLayout>

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
        status={proposalPageState.confirmStatusUpdate || null}
        loading={isUpdating}
        onClickAccept={(_, status, vesting_contract, enactingTx, description) =>
          updateProposal({ status, vesting_contract, enactingTx, description })
        }
        onClose={() => updatePageState({ confirmStatusUpdate: false })}
      />
      <ProposalSuccessModal
        open={proposalPageState.showProposalSuccessModal}
        onDismiss={closeProposalSuccessModal}
        onClose={closeProposalSuccessModal}
        proposal={proposal}
        loading={isLoadingProposal}
      />
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
