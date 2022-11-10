import React, { useCallback, useEffect, useMemo, useRef } from 'react'

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
import { VotingModal } from '../components/Modal/Votes/VotingModal'
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
import ProposalUpdatesActions from '../components/Section/ProposalUpdatesActions'
import SubscribeButton from '../components/Section/SubscribeButton'
import VestingContract from '../components/Section/VestingContract'
import StatusPill from '../components/Status/StatusPill'
import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import { forumUrl } from '../entities/Proposal/utils'
import { Survey } from '../entities/SurveyTopic/types'
import { SurveyEncoder } from '../entities/SurveyTopic/utils'
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

const PROPOSAL_STATUS_WITH_UPDATES = new Set([ProposalStatus.Passed, ProposalStatus.Enacted])
const EMPTY_CHOICE_SELECTION = { choice: undefined, choiceIndex: undefined }

export type SelectedChoice = { choice?: string; choiceIndex?: number }

export type ProposalPageOptions = {
  changing: boolean
  confirmSubscription: boolean
  confirmDeletion: boolean
  confirmStatusUpdate: ProposalStatus | false
  showVotesList: boolean
  showProposalSuccessModal: boolean
  showUpdateSuccessModal: boolean
  showVotingModal: boolean
  showVotingError: boolean
  selectedChoice: SelectedChoice
}

export default function ProposalPage() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [options, patchOptions] = usePatchState<ProposalPageOptions>({
    changing: false,
    confirmSubscription: false,
    confirmDeletion: false,
    confirmStatusUpdate: false,
    showVotesList: false,
    showProposalSuccessModal: false,
    showUpdateSuccessModal: false,
    showVotingModal: false,
    showVotingError: false,
    selectedChoice: EMPTY_CHOICE_SELECTION,
  })
  const patchOptionsRef = useRef(patchOptions)
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

  const { publicUpdates, pendingUpdates, nextUpdate, currentUpdate, refetchUpdates } = useProposalUpdates(proposal?.id)

  const subscribed = useMemo(
    () => !!account && !!subscriptions && !!subscriptions.find((sub) => sub.user === account),
    [account, subscriptions]
  )
  const [castingVote, castVote] = useAsyncTask(
    async (selectedChoice: SelectedChoice, survey?: Survey) => {
      if (proposal && account && provider && votes && selectedChoice.choiceIndex) {
        const web3Provider = new Web3Provider(provider)
        const [listedAccount] = await web3Provider.listAccounts()

        Promise.resolve()
          .then(async () => {
            await SnapshotApi.get().castVote(
              web3Provider,
              listedAccount,
              proposal.snapshot_id,
              selectedChoice.choiceIndex!,
              SurveyEncoder.encode(survey)
            )
          })
          .then(() => {
            patchOptions({
              changing: false,
              showVotingModal: false,
              showVotingError: false,
              confirmSubscription: !votes[account],
            })
            votesState.reload()
          })
          .catch((err) => {
            console.error(err, { ...err }) //TODO report error
            patchOptions({
              changing: false,
              showVotingError: true,
            })
          })
      }
    },
    [proposal, account, provider, votes]
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

        patchOptions({ confirmSubscription: false })
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
        patchOptions({ confirmStatusUpdate: false })
      }
    },
    [proposal, account, isCommittee, proposalState, patchOptions]
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
    patchOptionsRef.current({ showProposalSuccessModal: params.get('new') === 'true' })
  }, [params])

  useEffect(() => {
    patchOptionsRef.current({ showUpdateSuccessModal: params.get('newUpdate') === 'true' })
  }, [params])

  const closeProposalSuccessModal = () => {
    patchOptions({ showProposalSuccessModal: false })
    navigate(locations.proposal(proposal!.id), { replace: true })
  }

  const closeUpdateSuccessModal = () => {
    patchOptions({ showUpdateSuccessModal: false })
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

  const getVotingMethod = () => {
    return (selectedChoice: SelectedChoice) => {
      if (!isLoadingSurveyTopics && surveyTopics && surveyTopics.length > 0) {
        patchOptions({
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
              <ProposalComments proposal={proposal} loading={proposalState.loading} />
              {proposal && (
                <SurveyResults
                  votes={votes}
                  isLoadingVotes={votesState.loading}
                  surveyTopics={surveyTopics}
                  isLoadingSurveyTopics={isLoadingSurveyTopics}
                />
              )}
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
                  loading={castingVote || proposalState.loading || votesState.loading}
                  proposal={proposal}
                  votes={votes}
                  changingVote={options.changing}
                  selectedChoice={options.selectedChoice}
                  onChangeVote={(_, changing) => patchOptions({ changing })}
                  onOpenVotesList={() => patchOptions({ showVotesList: true })}
                  onVote={getVotingMethod()}
                  patchOptions={patchOptions}
                  showError={options.showVotingError}
                  onRetry={() => patchOptions({ showVotingError: false })}
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
                    patchOptions={patchOptions}
                  />
                )}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </ContentLayout>

      {proposal && (
        <VotingModal
          open={options.showVotingModal}
          surveyTopics={surveyTopics}
          isLoadingSurveyTopics={isLoadingSurveyTopics}
          onClose={() => patchOptions({ showVotingModal: false })}
          selectedChoice={options.selectedChoice}
          onCastVote={castVote}
          castingVote={castingVote}
          showError={options.showVotingError}
          onRetry={() => patchOptions({ showVotingError: false })}
        />
      )}
      <VotesListModal
        open={options.showVotesList}
        proposal={proposal}
        votes={votes}
        onClose={() => patchOptions({ showVotesList: false })}
      />
      <VoteRegisteredModal
        loading={subscribing}
        open={options.confirmSubscription}
        onClickAccept={() => subscribe()}
        onClose={() => patchOptions({ confirmSubscription: false })}
      />
      <DeleteProposalModal
        loading={deleting}
        open={options.confirmDeletion}
        onClickAccept={() => deleteProposal()}
        onClose={() => patchOptions({ confirmDeletion: false })}
      />
      <UpdateProposalStatusModal
        open={!!options.confirmStatusUpdate}
        proposal={proposal}
        status={options.confirmStatusUpdate || null}
        loading={updatingStatus}
        onClickAccept={(_, status, vesting_contract, enactingTx, description) =>
          updateProposalStatus(status, vesting_contract, enactingTx, description)
        }
        onClose={() => patchOptions({ confirmStatusUpdate: false })}
      />
      <ProposalSuccessModal
        open={options.showProposalSuccessModal}
        onDismiss={closeProposalSuccessModal}
        onClose={closeProposalSuccessModal}
        proposal={proposal}
        loading={proposalState.loading}
      />
      <UpdateSuccessModal
        open={options.showUpdateSuccessModal}
        onDismiss={closeUpdateSuccessModal}
        onClose={closeUpdateSuccessModal}
        proposalId={proposal?.id}
        updateId={publicUpdates?.[0]?.id}
        loading={proposalState.loading}
      />
    </>
  )
}
