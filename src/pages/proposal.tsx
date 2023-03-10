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
import { Button } from 'decentraland-ui/dist/components/Button/Button'
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
import ProposalComments from '../components/Proposal/Comments/ProposalComments'
import ProposalFooterPoi from '../components/Proposal/ProposalFooterPoi'
import ProposalHeaderPoi from '../components/Proposal/ProposalHeaderPoi'
import ProposalUpdates from '../components/Proposal/Update/ProposalUpdates'
import ProposalBudget from '../components/Proposal/View/Budget/ProposalBudget'
import GrantProposalView from '../components/Proposal/View/Categories/GrantProposalView'
import ForumButton from '../components/Proposal/View/ForumButton'
import ProposalCoAuthorStatus from '../components/Proposal/View/ProposalCoAuthorStatus'
import ProposalDetailSection from '../components/Proposal/View/ProposalDetailSection'
import ProposalImagesPreview from '../components/Proposal/View/ProposalImagesPreview'
import ProposalResultSection from '../components/Proposal/View/ProposalResultSection'
import ProposalUpdatesActions from '../components/Proposal/View/ProposalUpdatesActions'
import SubscribeButton from '../components/Proposal/View/SubscribeButton'
import VestingContract from '../components/Proposal/View/VestingContract'
import StatusPill from '../components/Status/StatusPill'
import { CoauthorStatus } from '../entities/Coauthor/types'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import {
  forumUrl,
  isProposalDeletable,
  isProposalEnactable,
  proposalCanBePassedOrRejected,
} from '../entities/Proposal/utils'
import useBudgetWithContestants from '../hooks/useBudgetWithContestants'
import useCoAuthorsByProposal from '../hooks/useCoAuthorsByProposal'
import useIsCommittee from '../hooks/useIsCommittee'
import useProposal from '../hooks/useProposal'
import useProposalUpdates from '../hooks/useProposalUpdates'
import useProposalVotes from '../hooks/useProposalVotes'
import locations from '../modules/locations'
import { isUnderMaintenance } from '../modules/maintenance'

import './proposal.css'

// TODO: Review why proposals.css is being imported and use only proposal.css

const PROPOSAL_STATUS_WITH_UPDATES = new Set([ProposalStatus.Passed, ProposalStatus.Enacted])

type ProposalPageOptions = {
  changing: boolean
  confirmSubscription: boolean
  confirmDeletion: boolean
  confirmStatusUpdate: ProposalStatus | false
  showVotesList: boolean
  showProposalSuccessModal: boolean
  showUpdateSuccessModal: boolean
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
  })
  const patchOptionsRef = useRef(patchOptions)
  const [account, { provider }] = useAuthContext()
  const [proposal, proposalState] = useProposal(params.get('id'))
  const { isCommittee } = useIsCommittee(account)
  const { votes, votesState } = useProposalVotes(proposal?.id)
  const [subscriptions, subscriptionsState] = useAsyncMemo(
    () => Governance.get().getSubscriptions(proposal!.id),
    [proposal],
    { callWithTruthyDeps: true }
  )
  const { budgetWithContestants, isLoadingBudgetWithContestants } = useBudgetWithContestants(proposal?.id)

  const { publicUpdates, pendingUpdates, nextUpdate, currentUpdate, refetchUpdates } = useProposalUpdates(proposal?.id)

  const subscribed = useMemo(
    () => !!account && !!subscriptions && !!subscriptions.find((sub) => sub.user === account),
    [account, subscriptions]
  )
  const [voting, vote] = useAsyncTask(
    async (_: string, choiceIndex: number) => {
      if (proposal && account && provider && votes) {
        const web3Provider = new Web3Provider(provider)
        const [listedAccount] = await web3Provider.listAccounts()
        await SnapshotApi.get().castVote(web3Provider, listedAccount, proposal.snapshot_id, choiceIndex)
        patchOptions({ changing: false, confirmSubscription: !votes[account] })
        votesState.reload()
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
        ...(hasPendingUpdates && currentUpdate && { id: currentUpdate?.id }),
        proposalId: proposal.id,
      })
    )
  }, [pendingUpdates, currentUpdate, proposal])

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

  const proposalStatus = proposal?.status
  const isProposalStatusWithUpdates = PROPOSAL_STATUS_WITH_UPDATES.has(proposalStatus as ProposalStatus)
  const showProposalUpdatesActions =
    isProposalStatusWithUpdates && proposal?.type === ProposalType.Grant && (isOwner || isCoauthor)
  const showProposalUpdates = publicUpdates && isProposalStatusWithUpdates && proposal?.type === ProposalType.Grant
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
            {proposal && <StatusPill status={proposal.status} />}
            {proposal && <CategoryPill proposalType={proposal.type} />}
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
                  isCoauthor={isCoauthor}
                  onUpdateDeleted={refetchUpdates}
                />
              )}
              <ProposalComments proposal={proposal} loading={proposalState.loading} />
            </Grid.Column>

            <Grid.Column tablet="4" className="ProposalDetailActions">
              {!!proposal?.vesting_address && <VestingContract vestingAddress={proposal.vesting_address} />}
              {proposal && <ProposalCoAuthorStatus proposalId={proposal.id} proposalFinishDate={proposal.finish_at} />}
              <div className="ProposalDetail__StickySidebar">
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
                {showProposalUpdatesActions && (
                  <ProposalUpdatesActions
                    nextUpdate={nextUpdate}
                    currentUpdate={currentUpdate}
                    onPostUpdateClick={handlePostUpdateClick}
                  />
                )}
                <ProposalResultSection
                  disabled={!proposal || !votes}
                  loading={voting || proposalState.loading || votesState.loading}
                  proposal={proposal}
                  votes={votes}
                  changingVote={options.changing}
                  onChangeVote={(_, changing) => patchOptions({ changing })}
                  onOpenVotesList={() => patchOptions({ showVotesList: true })}
                  onVote={(_, choice, choiceIndex) => vote(choice, choiceIndex)}
                />
                {proposal && <ProposalDetailSection proposal={proposal} />}
                {(isOwner || isCommittee) && (
                  <Button
                    basic
                    fluid
                    loading={deleting}
                    disabled={!isProposalDeletable(proposalStatus)}
                    onClick={() => patchOptions({ confirmDeletion: true })}
                  >
                    {t('page.proposal_detail.delete')}
                  </Button>
                )}
                {isCommittee && isProposalEnactable(proposalStatus) && (
                  <Button
                    basic
                    loading={updatingStatus}
                    fluid
                    onClick={() =>
                      patchOptions({
                        confirmStatusUpdate: ProposalStatus.Enacted,
                      })
                    }
                  >
                    {t(
                      proposalStatus === ProposalStatus.Passed
                        ? 'page.proposal_detail.enact'
                        : 'page.proposal_detail.edit_enacted_data'
                    )}
                  </Button>
                )}
                {isCommittee && proposalCanBePassedOrRejected(proposalStatus) && (
                  <>
                    <Button
                      basic
                      loading={updatingStatus}
                      fluid
                      onClick={() => patchOptions({ confirmStatusUpdate: ProposalStatus.Passed })}
                    >
                      {t('page.proposal_detail.pass')}
                    </Button>
                    <Button
                      basic
                      loading={updatingStatus}
                      fluid
                      onClick={() =>
                        patchOptions({
                          confirmStatusUpdate: ProposalStatus.Rejected,
                        })
                      }
                    >
                      {t('page.proposal_detail.reject')}
                    </Button>
                  </>
                )}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </ContentLayout>
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
