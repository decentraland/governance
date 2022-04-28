import React, { useCallback, useMemo, useEffect } from 'react'
import { useLocation } from '@reach/router'
import { Personal } from 'web3x/personal'
import { Address } from 'web3x/address'
import useAsyncTask from 'decentraland-gatsby/dist/hooks/useAsyncTask'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import usePatchState from 'decentraland-gatsby/dist/hooks/usePatchState'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Governance } from '../api/Governance'
import useProposal from '../hooks/useProposal'
import ContentLayout, { ContentSection } from '../components/Layout/ContentLayout'
import CategoryLabel from '../components/Category/CategoryLabel'
import StatusLabel from '../components/Status/StatusLabel'
import ForumButton from '../components/Section/ForumButton'
import SubscribeButton from '../components/Section/SubscribeButton'
import ProposalResultSection from '../components/Section/ProposalResultSection'
import ProposalDetailSection from '../components/Section/ProposalDetailSection'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { forumUrl } from '../entities/Proposal/utils'
import { Snapshot } from '../api/Snapshot'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import { VoteRegisteredModal } from '../components/Modal/VoteRegisteredModal'
import { DeleteProposalModal } from '../components/Modal/DeleteProposalModal'
import { VotesList } from '../components/Modal/VotesList'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import retry from 'decentraland-gatsby/dist/utils/promise/retry'
import locations from '../modules/locations'
import { UpdateProposalStatusModal } from '../components/Modal/UpdateProposalStatusModal'
import { ProposalStatus, ProposalType } from '../entities/Proposal/types'
import ProposalHeaderPoi from '../components/Proposal/ProposalHeaderPoi'
import Head from 'decentraland-gatsby/dist/components/Head/Head'
import { formatDescription } from 'decentraland-gatsby/dist/components/Head/utils'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import ProposalFooterPoi from '../components/Proposal/ProposalFooterPoi'
import ProposalComments from '../components/Proposal/ProposalComments'
import ProposalSuccessModal from '../components/Modal/ProposalSuccessModal'
import { isUnderMaintenance } from '../modules/maintenance'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import ProposalVestingStatus from '../components/Section/ProposalVestingStatus'
import ProposalUpdates from '../components/Proposal/ProposalUpdates'
import useProposalUpdates from '../hooks/useProposalUpdates'
import { UpdateAttributes } from '../entities/Updates/types'
import UpdateSuccessModal from '../components/Modal/UpdateSuccessModal'
import useProfile from '../hooks/useProfile'
import './index.css'
import './proposal.css'

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
  const [account, { provider }] = useAuthContext()
  const [proposal, proposalState] = useProposal(params.get('id'))
  const { profile } = useProfile(proposal?.user)
  const [committee] = useAsyncMemo(() => Governance.get().getCommittee(), [])
  const [votes, votesState] = useAsyncMemo(() => Governance.get().getProposalVotes(proposal!.id), [proposal], {
    callWithTruthyDeps: true,
  })
  const [subscriptions, subscriptionsState] = useAsyncMemo(
    () => Governance.get().getSubscriptions(proposal!.id),
    [proposal],
    { callWithTruthyDeps: true }
  )
  const [votingPower, votingPowerState] = useAsyncMemo(
    () =>
      account && proposal!.status === ProposalStatus.Active
        ? Governance.get().getVotingPower(proposal!.id)
        : Promise.resolve(0),
    [account, proposal],
    { callWithTruthyDeps: true }
  )

  const { publicUpdates, pendingUpdates, nextUpdate, currentUpdate } = useProposalUpdates(proposal?.id)

  const subscribed = useMemo(
    () => !!account && !!subscriptions && !!subscriptions.find((sub) => sub.user === account),
    [account, subscriptions]
  )
  const [voting, vote] = useAsyncTask(
    async (_: string, choiceIndex: number) => {
      if (proposal && account && provider && votes) {
        const message = await Snapshot.get().createVoteMessage(
          proposal.snapshot_space,
          proposal.snapshot_id,
          choiceIndex
        )
        const signature = await new Personal(provider).sign(message, Address.fromString(account), '')
        await retry(3, () => Snapshot.get().send(account, message, signature))
        patchOptions({ changing: false, confirmSubscription: !votes[account] })
        votesState.reload()
      }
    },
    [proposal, account, provider, votes]
  )

  const [subscribing, subscribe] = useAsyncTask(
    async (subscribe: boolean = true) => {
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
    async (status: ProposalStatus, vesting_address: string | null, description: string) => {
      if (proposal && account && committee && committee.includes(account)) {
        const updateProposal = await Governance.get().updateProposalStatus(
          proposal.id,
          status,
          vesting_address,
          description
        )
        proposalState.set(updateProposal)
        patchOptions({ confirmStatusUpdate: false })
      }
    },
    [proposal, account, committee, proposalState, patchOptions]
  )

  const isOwner = useMemo(() => !!(proposal && account && proposal.user === account), [proposal, account])
  const isCommittee = useMemo(
    () => !!(proposal && account && committee && committee.includes(account)),
    [proposal, account, committee]
  )

  const [deleting, deleteProposal] = useAsyncTask(async () => {
    if (proposal && account && (proposal.user === account || isCommittee)) {
      await Governance.get().deleteProposal(proposal.id)
      navigate(locations.proposals())
    }
  }, [proposal, account, isCommittee])

  useEffect(() => {
    patchOptions({ showProposalSuccessModal: params.get('new') === 'true' })
  }, [])

  useEffect(() => {
    patchOptions({ showUpdateSuccessModal: params.get('newUpdate') === 'true' })
  }, [])

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
  }, [nextUpdate?.id, proposal?.id])

  const handleUpdateClick = (update: UpdateAttributes) => navigate(`/update?id=${update.id}`)

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
      <>
        <Head
          title={t('page.proposal_detail.title') || ''}
          description={t('page.proposal_detail.description') || ''}
          image="https://decentraland.org/images/decentraland.png"
        />
        <ContentLayout className="ProposalDetailPage">
          <MaintenancePage />
        </ContentLayout>
      </>
    )
  }

  const showVestingStatus =
    proposal?.status === ProposalStatus.Enacted && proposal?.type === ProposalType.Grant && isOwner
  const showProposalUpdates =
    publicUpdates && proposal?.status === ProposalStatus.Enacted && proposal?.type === ProposalType.Grant

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
          <div style={{ minHeight: '24px' }}>
            {proposal && <StatusLabel status={proposal.status} />}
            {proposal && <CategoryLabel type={proposal.type} />}
          </div>
        </ContentSection>
        <Grid stackable>
          <Grid.Row>
            <Grid.Column tablet="12" className="ProposalDetailDescription">
              <Loader active={proposalState.loading} />
              <ProposalHeaderPoi proposal={proposal} />
              <Markdown>{proposal?.description || ''}</Markdown>
              <ProposalFooterPoi proposal={proposal} />
              {showProposalUpdates && (
                <ProposalUpdates proposal={proposal} updates={publicUpdates} onUpdateClick={handleUpdateClick} />
              )}
              <ProposalComments proposal={proposal} loading={proposalState.loading} />
            </Grid.Column>

            <Grid.Column tablet="4" className="ProposalDetailActions">
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
              {showVestingStatus && (
                <ProposalVestingStatus
                  nextUpdate={nextUpdate}
                  currentUpdate={currentUpdate}
                  pendingUpdates={pendingUpdates}
                  onPostUpdateClick={handlePostUpdateClick}
                />
              )}
              <ProposalResultSection
                disabled={!proposal || !votes}
                loading={voting || proposalState.loading || votesState.loading || votingPowerState.loading}
                proposal={proposal}
                votes={votes}
                votingPower={votingPower || 0}
                changingVote={options.changing}
                onChangeVote={(_, changing) => patchOptions({ changing })}
                onOpenVotesList={() => patchOptions({ showVotesList: true })}
                onVote={(_, choice, choiceIndex) => vote(choice, choiceIndex)}
              />
              <ProposalDetailSection proposal={proposal} profile={profile} />
              {(isOwner || isCommittee) && (
                <Button
                  basic
                  loading={deleting}
                  style={{ width: '100%' }}
                  disabled={proposal?.status !== ProposalStatus.Pending && proposal?.status !== ProposalStatus.Active}
                  onClick={() => patchOptions({ confirmDeletion: true })}
                >
                  {t('page.proposal_detail.delete')}
                </Button>
              )}
              {isCommittee && proposal?.status === ProposalStatus.Passed && (
                <Button
                  basic
                  loading={updatingStatus}
                  style={{ width: '100%' }}
                  onClick={() =>
                    patchOptions({
                      confirmStatusUpdate: ProposalStatus.Enacted,
                    })
                  }
                >
                  {t('page.proposal_detail.enact')}
                </Button>
              )}
              {isCommittee && proposal?.status === ProposalStatus.Finished && (
                <>
                  <Button
                    basic
                    loading={updatingStatus}
                    style={{ width: '100%' }}
                    onClick={() => patchOptions({ confirmStatusUpdate: ProposalStatus.Passed })}
                  >
                    {t('page.proposal_detail.pass')}
                  </Button>
                  <Button
                    basic
                    loading={updatingStatus}
                    style={{ width: '100%' }}
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
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </ContentLayout>
      <VotesList
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
        onClickAccept={(_, status, vesting_contract, description) =>
          updateProposalStatus(status, vesting_contract, description)
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
