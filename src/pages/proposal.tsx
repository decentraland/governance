import React, { useEffect, useMemo, useRef, useState } from 'react'

import { ErrorCode } from '@ethersproject/logger'
import { Web3Provider } from '@ethersproject/providers'
import { useLocation } from '@gatsbyjs/reach-router'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import { formatDescription } from 'decentraland-gatsby/dist/components/Head/utils'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useAsyncTask from 'decentraland-gatsby/dist/hooks/useAsyncTask'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import usePatchState from 'decentraland-gatsby/dist/hooks/usePatchState'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { Governance } from '../clients/Governance'
import { SnapshotApi } from '../clients/SnapshotApi'
import CategoryPill from '../components/Category/CategoryPill'
import ContentLayout, { ContentSection } from '../components/Layout/ContentLayout'
import MaintenanceLayout from '../components/Layout/MaintenanceLayout'
import { DeleteProposalModal } from '../components/Modal/DeleteProposalModal/DeleteProposalModal'
import ProposalSuccessModal from '../components/Modal/ProposalSuccessModal'
import { UpdateProposalStatusModal } from '../components/Modal/UpdateProposalStatusModal/UpdateProposalStatusModal'
import UpdateSuccessModal from '../components/Modal/UpdateSuccessModal'
import { VoteRegisteredModal } from '../components/Modal/Votes/VoteRegisteredModal'
import { VotesListModal } from '../components/Modal/Votes/VotesList'
import { VotingModal } from '../components/Modal/Votes/VotingModal/VotingModal'
import ProposalComments from '../components/Proposal/Comments/ProposalComments'
import ProposalFooterPoi from '../components/Proposal/ProposalFooterPoi'
import ProposalHeaderPoi from '../components/Proposal/ProposalHeaderPoi'
import ProposalSidebar from '../components/Proposal/ProposalSidebar'
import SurveyResults from '../components/Proposal/SentimentSurvey/SurveyResults'
import ProposalUpdates from '../components/Proposal/Update/ProposalUpdates'
import ProposalBudget from '../components/Proposal/View/Budget/ProposalBudget'
import GrantProposalView from '../components/Proposal/View/Categories/GrantProposalView'
import ProposalImagesPreview from '../components/Proposal/View/ProposalImagesPreview'
import StatusPill from '../components/Status/StatusPill'
import { VOTES_VP_THRESHOLD } from '../constants'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { Survey } from '../entities/SurveyTopic/types'
import { SurveyEncoder } from '../entities/SurveyTopic/utils'
import { isProposalStatusWithUpdates } from '../entities/Updates/utils'
import { SelectedVoteChoice, Vote } from '../entities/Votes/types'
import { calculateResult } from '../entities/Votes/utils'
import useBudgetWithContestants from '../hooks/useBudgetWithContestants'
import useIsCommittee from '../hooks/useIsCommittee'
import useIsProposalCoAuthor from '../hooks/useIsProposalCoAuthor'
import useIsProposalOwner from '../hooks/useIsProposalOwner'
import useProposal from '../hooks/useProposal'
import useProposalUpdates from '../hooks/useProposalUpdates'
import useProposalVotes from '../hooks/useProposalVotes'
import useSurveyTopics from '../hooks/useSurveyTopics'
import locations from '../modules/locations'
import { isUnderMaintenance } from '../modules/maintenance'
import { ErrorService } from '../services/ErrorService'

import './proposal.css'

// TODO: Review why proposals.css is being imported and use only proposal.css

const EMPTY_VOTE_CHOICE_SELECTION: SelectedVoteChoice = { choice: undefined, choiceIndex: undefined }
const EMPTY_VOTE_CHOICES: string[] = []
const MAX_ERRORS_BEFORE_SNAPSHOT_REDIRECT = 3
const SECONDS_FOR_VOTING_RETRY = 5

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

export default function ProposalPage() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
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
  const [errorCounter, setErrorCounter] = useState(0)
  const updatePageStateRef = useRef(updatePageState)
  const [account, { provider }] = useAuthContext()
  const [proposal, proposalState] = useProposal(params.get('id'))
  const { isCommittee } = useIsCommittee(account)
  const { isCoauthor } = useIsProposalCoAuthor(proposal)
  const { isOwner } = useIsProposalOwner(proposal)
  const { votes, votesState } = useProposalVotes(proposal?.id)
  const { highQualityVotes, lowQualityVotes } = useMemo(() => getVoteSegmentation(votes), [votes])
  const { surveyTopics, isLoadingSurveyTopics } = useSurveyTopics(proposal?.id)
  const [subscriptions, subscriptionsState] = useAsyncMemo(
    () => Governance.get().getSubscriptions(proposal!.id),
    [proposal],
    { callWithTruthyDeps: true }
  )
  const { budgetWithContestants, isLoadingBudgetWithContestants } = useBudgetWithContestants(proposal?.id)

  const choices: string[] = proposal?.snapshot_proposal?.choices || EMPTY_VOTE_CHOICES
  const partialResults = useMemo(() => calculateResult(choices, highQualityVotes || {}), [choices, highQualityVotes])
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
          votesState.reload()
        } catch (err) {
          ErrorService.report('Unable to vote: ', err)
          console.error(err, { ...(err as Error) })
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

  const [subscribing, subscribe] = useAsyncTask<[subscribe?: boolean | undefined]>(
    async (subscribe = true) => {
      if (proposal) {
        if (subscribe) {
          const newSubscription = await Governance.get().subscribe(proposal.id)
          subscriptionsState.set((current) => [...(current || []), newSubscription])
        } else {
          await Governance.get().unsubscribe(proposal.id)
          subscriptionsState.set((current) =>
            (current || []).filter((subscription) => subscription.proposal_id !== proposal.id)
          )
        }

        updatePageState({ confirmSubscription: false })
      }
    },
    [proposal, subscriptionsState]
  )

  const [updatingStatus, updateProposalStatus] = useAsyncTask(
    async (status: ProposalStatus, vesting_address: string | null, enactingTx: string | null, description: string) => {
      if (proposal && isCommittee) {
        const updateProposal = await Governance.get().updateProposalStatus(
          proposal.id,
          status,
          vesting_address,
          enactingTx,
          description
        )
        proposalState.set(updateProposal)
        updatePageState({ confirmStatusUpdate: false })
      }
    },
    [proposal, account, isCommittee, proposalState, updatePageState]
  )

  const [deleting, deleteProposal] = useAsyncTask(async () => {
    if (proposal && account && (proposal.user === account || isCommittee)) {
      await Governance.get().deleteProposal(proposal.id)
      navigate(locations.proposals())
    }
  }, [proposal, account, isCommittee])

  useEffect(() => {
    updatePageStateRef.current({ showProposalSuccessModal: params.get('new') === 'true' })
  }, [params])

  useEffect(() => {
    updatePageStateRef.current({ showUpdateSuccessModal: params.get('newUpdate') === 'true' })
  }, [params])

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

  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })
  const voteWithSurvey = !isLoadingSurveyTopics && !!surveyTopics && surveyTopics.length > 0 && !isMobile

  if (proposalState.error) {
    return (
      <>
        <ContentLayout className="ProposalDetailPage">
          <NotFound />
        </ContentLayout>
      </>
    )
  }

  if (isUnderMaintenance()) {
    return (
      <MaintenanceLayout title={t('page.proposal_detail.title')} description={t('page.proposal_detail.description')} />
    )
  }

  const showImagesPreview =
    !proposalState.loading && proposal?.type === ProposalType.LinkedWearables && !!proposal.configuration.image_previews
  const showProposalBudget =
    proposal?.type === ProposalType.Grant &&
    !isLoadingBudgetWithContestants &&
    proposal.status === ProposalStatus.Active

  return (
    <>
      <Head
        title={proposal?.title || t('page.proposal_detail.title') || ''}
        description={
          (proposal?.description && formatDescription(proposal?.description)) ||
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
            <Grid.Column tablet="12" className="ProposalDetailDescription">
              <Loader active={proposalState.loading} />
              {showProposalBudget && <ProposalBudget proposal={proposal} budget={budgetWithContestants} />}
              <ProposalHeaderPoi proposal={proposal} />
              {showImagesPreview && <ProposalImagesPreview imageUrls={proposal.configuration.image_previews} />}
              {proposal?.type === ProposalType.Grant ? (
                <GrantProposalView config={proposal.configuration} />
              ) : (
                <Markdown>{proposal?.description || ''}</Markdown>
              )}
              {proposal?.type === ProposalType.POI && <ProposalFooterPoi configuration={proposal.configuration} />}
              {showProposalUpdates && (
                <ProposalUpdates
                  proposal={proposal}
                  updates={publicUpdates}
                  onUpdateDeleted={refetchUpdates}
                  isCoauthor={isCoauthor}
                />
              )}
              {proposal && (
                <SurveyResults
                  votes={votes}
                  isLoadingVotes={votesState.loading}
                  surveyTopics={surveyTopics}
                  isLoadingSurveyTopics={isLoadingSurveyTopics}
                />
              )}
              <ProposalComments proposal={proposal} loading={proposalState.loading} />
            </Grid.Column>

            <Grid.Column tablet="4" className="ProposalDetailActions">
              <ProposalSidebar
                proposal={proposal}
                proposalLoading={proposalState.loading}
                deleting={deleting}
                proposalPageState={proposalPageState}
                updatePageState={updatePageState}
                pendingUpdates={pendingUpdates}
                currentUpdate={currentUpdate}
                nextUpdate={nextUpdate}
                castingVote={castingVote}
                castVote={castVote}
                voteWithSurvey={voteWithSurvey}
                updatingStatus={updatingStatus}
                subscribing={subscribing}
                subscribe={subscribe}
                subscriptions={subscriptions}
                subscriptionsLoading={subscriptionsState.loading}
                partialResults={partialResults}
                choices={choices}
                votes={votes}
                votesLoading={votesState.loading}
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
        loading={subscribing}
        open={proposalPageState.confirmSubscription}
        onClickAccept={() => subscribe()}
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
        loading={updatingStatus}
        onClickAccept={(_, status, vesting_contract, enactingTx, description) =>
          updateProposalStatus(status, vesting_contract, enactingTx, description)
        }
        onClose={() => updatePageState({ confirmStatusUpdate: false })}
      />
      <ProposalSuccessModal
        open={proposalPageState.showProposalSuccessModal}
        onDismiss={closeProposalSuccessModal}
        onClose={closeProposalSuccessModal}
        proposal={proposal}
        loading={proposalState.loading}
      />
      <UpdateSuccessModal
        open={proposalPageState.showUpdateSuccessModal}
        onDismiss={closeUpdateSuccessModal}
        onClose={closeUpdateSuccessModal}
        proposalId={proposal?.id}
        updateId={publicUpdates?.[0]?.id}
        loading={proposalState.loading}
      />
    </>
  )
}
