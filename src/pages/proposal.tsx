import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
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
import ProposalActions from '../components/Proposal/ProposalActions'
import ProposalComments from '../components/Proposal/ProposalComments'
import ProposalFooterPoi from '../components/Proposal/ProposalFooterPoi'
import ProposalHeaderPoi from '../components/Proposal/ProposalHeaderPoi'
import SurveyResults from '../components/Proposal/SentimentSurvey/SurveyResults'
import ProposalUpdates from '../components/Proposal/Update/ProposalUpdates'
import ProposalImagesPreview from '../components/ProposalImagesPreview/ProposalImagesPreview'
import ForumButton from '../components/Section/ForumButton'
import ProposalCoAuthorStatus from '../components/Section/ProposalCoAuthorStatus'
import ProposalDetailSection from '../components/Section/ProposalDetailSection'
import ProposalGovernanceSection from '../components/Section/ProposalGovernanceSection'
import ProposalResults from '../components/Section/ProposalResults'
import ProposalUpdatesActions from '../components/Section/ProposalUpdatesActions'
import SubscribeButton from '../components/Section/SubscribeButton'
import VestingContract from '../components/Section/VestingContract'
import StatusPill from '../components/Status/StatusPill'
import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { forumUrl } from '../entities/Proposal/utils'
import { Survey } from '../entities/SurveyTopic/types'
import { SurveyEncoder } from '../entities/SurveyTopic/utils'
import { calculateResult } from '../entities/Votes/utils'
import useCoAuthorsByProposal from '../hooks/useCoAuthorsByProposal'
import useIsCommittee from '../hooks/useIsCommittee'
import useProposal from '../hooks/useProposal'
import useProposalUpdates from '../hooks/useProposalUpdates'
import useProposalVotes from '../hooks/useProposalVotes'
import useSurveyTopics from '../hooks/useSurveyTopics'
import locations from '../modules/locations'
import { isUnderMaintenance } from '../modules/maintenance'

import './proposal.css'
import './proposals.css'

// TODO: Review why proposals.css is being imported and use only proposal.css

export type SelectedChoice = { choice?: string; choiceIndex?: number }
const EMPTY_CHOICE_SELECTION: SelectedChoice = { choice: undefined, choiceIndex: undefined }
const PROPOSAL_STATUS_WITH_UPDATES = new Set([ProposalStatus.Passed, ProposalStatus.Enacted])
const EMPTY_CHOICES: string[] = []
const MAX_ERRORS_BEFORE_SNAPSHOT_REDIRECT = 3
const SECONDS_FOR_VOTING_RETRY = 5

export type ProposalPageContext = {
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
  selectedChoice: SelectedChoice
}

export default function ProposalPage() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [proposalContext, updateContext] = usePatchState<ProposalPageContext>({
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
    selectedChoice: EMPTY_CHOICE_SELECTION,
  })
  const [errorCounter, setErrorCounter] = useState(0)
  const updateContextRef = useRef(updateContext)
  const [account, { provider }] = useAuthContext()
  const [proposal, proposalState] = useProposal(params.get('id'))
  const { isCommittee } = useIsCommittee(account)
  const { votes, votesState } = useProposalVotes(proposal?.id)
  const { surveyTopics, isLoadingSurveyTopics } = useSurveyTopics(proposal?.id)
  const [subscriptions, subscriptionsState] = useAsyncMemo(
    () => Governance.get().getSubscriptions(proposal!.id),
    [proposal],
    { callWithTruthyDeps: true }
  )
  const choices: string[] = proposal?.snapshot_proposal?.choices || EMPTY_CHOICES
  const partialResults = useMemo(() => calculateResult(choices, votes || {}), [choices, votes])

  const { publicUpdates, pendingUpdates, nextUpdate, currentUpdate, refetchUpdates } = useProposalUpdates(proposal?.id)

  const subscribed = useMemo(
    () => !!account && !!subscriptions && !!subscriptions.find((sub) => sub.user === account),
    [account, subscriptions]
  )

  const proposalResults = useRef<HTMLDivElement>(null)

  const handleScrollClick = () => {
    proposalResults.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const [castingVote, castVote] = useAsyncTask(
    async (selectedChoice: SelectedChoice, survey?: Survey) => {
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
          updateContext({
            changingVote: false,
            showVotingModal: false,
            showVotingError: false,
            confirmSubscription: !votes![account!],
          })
          votesState.reload()
        } catch (err) {
          console.error(err, { ...(err as Error) }) //TODO report error
          if ((err as any).code === ErrorCode.ACTION_REJECTED) {
            updateContext({
              changingVote: false,
            })
          } else {
            updateContext({
              changingVote: false,
              showVotingError: true,
              showSnapshotRedirect: errorCounter + 1 >= MAX_ERRORS_BEFORE_SNAPSHOT_REDIRECT,
            })
            setErrorCounter((prev) => prev + 1)
          }
        }
      }
    },
    [proposal, account, provider, votes, proposalContext.selectedChoice]
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

        updateContext({ confirmSubscription: false })
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
        updateContext({ confirmStatusUpdate: false })
      }
    },
    [proposal, account, isCommittee, proposalState, updateContext]
  )

  const isOwner = useMemo(() => !!(proposal && account && proposal.user === account), [proposal, account])
  const isCoauthor = !!useCoAuthorsByProposal(proposal).find(
    (coauthor) =>
      coauthor.address?.toLowerCase() === account?.toLowerCase() && coauthor.status === CoauthorStatus.APPROVED
  )

  const [deleting, deleteProposal] = useAsyncTask(async () => {
    if (proposal && account && (proposal.user === account || isCommittee)) {
      await Governance.get().deleteProposal(proposal.id)
      navigate(locations.proposals())
    }
  }, [proposal, account, isCommittee])

  useEffect(() => {
    updateContextRef.current({ showProposalSuccessModal: params.get('new') === 'true' })
  }, [params])

  useEffect(() => {
    updateContextRef.current({ showUpdateSuccessModal: params.get('newUpdate') === 'true' })
  }, [params])

  useEffect(() => {
    if (proposalContext.showVotingError) {
      const timer = setTimeout(() => {
        updateContext({ retryTimer: proposalContext.retryTimer - 1 })
      }, 1000)

      if (proposalContext.retryTimer <= 0) {
        updateContext({ retryTimer: SECONDS_FOR_VOTING_RETRY, showVotingError: false })
      }
      return () => clearTimeout(timer)
    }
  }, [proposalContext.showVotingError, proposalContext.retryTimer])

  const closeProposalSuccessModal = () => {
    updateContext({ showProposalSuccessModal: false })
    navigate(locations.proposal(proposal!.id), { replace: true })
  }

  const closeUpdateSuccessModal = () => {
    updateContext({ showUpdateSuccessModal: false })
    navigate(locations.proposal(proposal!.id), { replace: true })
  }

  const handlePostUpdateClick = useCallback(() => {
    if (proposal === null) {
      return
    }

    const hasPendingUpdates = pendingUpdates && pendingUpdates.length > 0
    navigate(
      locations.submitUpdate({
        ...(hasPendingUpdates && { id: currentUpdate?.id }),
        proposalId: proposal.id,
      })
    )
  }, [currentUpdate?.id, pendingUpdates, proposal])

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

  const isProposalStatusWithUpdates = PROPOSAL_STATUS_WITH_UPDATES.has(proposal?.status as ProposalStatus)
  const showProposalUpdatesActions =
    isProposalStatusWithUpdates && proposal?.type === ProposalType.Grant && (isOwner || isCoauthor)
  const showProposalUpdates = publicUpdates && isProposalStatusWithUpdates && proposal?.type === ProposalType.Grant
  const showImagesPreview =
    !proposalState.loading && proposal?.type === ProposalType.LinkedWearables && !!proposal.configuration.image_previews
  const showSurvey = !isLoadingSurveyTopics && surveyTopics && surveyTopics.length > 0

  const getVotingMethod = () => {
    return (selectedChoice: SelectedChoice) => {
      if (showSurvey) {
        updateContext({
          selectedChoice: selectedChoice,
          showVotingModal: true,
        })
      } else {
        castVote(selectedChoice)
      }
    }
  }

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
            {proposal && <StatusPill status={proposal.status} />}
            {proposal && <CategoryPill type={proposal.type} />}
          </div>
        </ContentSection>
        <Grid stackable>
          <Grid.Row>
            <Grid.Column tablet="12" className="ProposalDetailDescription">
              <Loader active={proposalState.loading} />
              <ProposalHeaderPoi proposal={proposal} />
              {showImagesPreview && <ProposalImagesPreview imageUrls={proposal.configuration.image_previews} />}
              <Markdown>{proposal?.description || ''}</Markdown>
              {proposal?.type === ProposalType.POI && <ProposalFooterPoi configuration={proposal.configuration} />}
              {showProposalUpdates && (
                <ProposalUpdates
                  proposal={proposal}
                  updates={publicUpdates}
                  isCoauthor={isCoauthor}
                  onUpdateDeleted={refetchUpdates}
                />
              )}
              {proposal && (
                <>
                  <SurveyResults
                    votes={votes}
                    isLoadingVotes={votesState.loading}
                    surveyTopics={surveyTopics}
                    isLoadingSurveyTopics={isLoadingSurveyTopics}
                  />
                  <ProposalResults
                    proposal={proposal}
                    votes={votes}
                    partialResults={partialResults}
                    loading={proposalState.loading || votesState.loading}
                    onOpenVotesList={() => updateContext({ showVotesList: true })}
                    elementRef={proposalResults}
                  />
                </>
              )}
              <ProposalComments proposal={proposal} loading={proposalState.loading} />
            </Grid.Column>

            <Grid.Column tablet="4" className="ProposalDetailActions">
              {!!proposal?.vesting_address && <VestingContract vestingAddress={proposal.vesting_address} />}
              {proposal && <ProposalCoAuthorStatus proposalId={proposal.id} proposalFinishDate={proposal.finish_at} />}
              <div className="ProposalDetail__StickySidebar">
                {showProposalUpdatesActions && (
                  <ProposalUpdatesActions
                    nextUpdate={nextUpdate}
                    currentUpdate={currentUpdate}
                    onPostUpdateClick={handlePostUpdateClick}
                  />
                )}
                <ProposalGovernanceSection
                  disabled={!proposal || !votes}
                  loading={proposalState.loading || votesState.loading}
                  proposal={proposal}
                  votes={votes}
                  partialResults={partialResults}
                  choices={choices}
                  castingVote={castingVote}
                  onChangeVote={(_, changing) => updateContext({ changingVote: changing })}
                  onVote={getVotingMethod()}
                  updateContext={updateContext}
                  proposalContext={proposalContext}
                  handleScrollTo={handleScrollClick}
                />
                <ForumButton
                  loading={proposalState.loading}
                  disabled={!proposal}
                  href={(proposal && forumUrl(proposal)) || ''}
                />
                <SubscribeButton
                  loading={proposalState.loading || subscriptionsState.loading || subscribing}
                  disabled={!proposal}
                  subscribed={subscribed}
                  onClick={() => subscribe(!subscribed)}
                />
                {proposal && <ProposalDetailSection proposal={proposal} />}
                {proposal && (
                  <ProposalActions
                    isOwner={isOwner}
                    isCommittee={isCommittee}
                    deleting={deleting}
                    updatingStatus={updatingStatus}
                    proposal={proposal}
                    updateContext={updateContext}
                  />
                )}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </ContentLayout>

      {proposal && showSurvey && (
        <VotingModal
          proposal={proposal}
          surveyTopics={surveyTopics}
          isLoadingSurveyTopics={isLoadingSurveyTopics}
          onClose={() => {
            setErrorCounter(0)
            updateContext({ showVotingModal: false, showSnapshotRedirect: false })
          }}
          onCastVote={castVote}
          castingVote={castingVote}
          proposalContext={proposalContext}
        />
      )}
      <VotesListModal
        open={proposalContext.showVotesList}
        proposal={proposal}
        votes={votes}
        onClose={() => updateContext({ showVotesList: false })}
      />
      <VoteRegisteredModal
        loading={subscribing}
        open={proposalContext.confirmSubscription}
        onClickAccept={() => subscribe()}
        onClose={() => updateContext({ confirmSubscription: false })}
      />
      <DeleteProposalModal
        loading={deleting}
        open={proposalContext.confirmDeletion}
        onClickAccept={() => deleteProposal()}
        onClose={() => updateContext({ confirmDeletion: false })}
      />
      <UpdateProposalStatusModal
        open={!!proposalContext.confirmStatusUpdate}
        proposal={proposal}
        status={proposalContext.confirmStatusUpdate || null}
        loading={updatingStatus}
        onClickAccept={(_, status, vesting_contract, enactingTx, description) =>
          updateProposalStatus(status, vesting_contract, enactingTx, description)
        }
        onClose={() => updateContext({ confirmStatusUpdate: false })}
      />
      <ProposalSuccessModal
        open={proposalContext.showProposalSuccessModal}
        onDismiss={closeProposalSuccessModal}
        onClose={closeProposalSuccessModal}
        proposal={proposal}
        loading={proposalState.loading}
      />
      <UpdateSuccessModal
        open={proposalContext.showUpdateSuccessModal}
        onDismiss={closeUpdateSuccessModal}
        onClose={closeUpdateSuccessModal}
        proposalId={proposal?.id}
        updateId={publicUpdates?.[0]?.id}
        loading={proposalState.loading}
      />
    </>
  )
}
