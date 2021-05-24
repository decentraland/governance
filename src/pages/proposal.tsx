
import React, { useMemo } from "react"
import { useLocation  } from '@reach/router'
import { Personal } from 'web3x/personal'
import { Address } from 'web3x/address'
import useAsyncTask from 'decentraland-gatsby/dist/hooks/useAsyncTask'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import usePatchState from 'decentraland-gatsby/dist/hooks/usePatchState'
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Loader } from "decentraland-ui/dist/components/Loader/Loader"
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { navigate } from "gatsby-plugin-intl"
import { Governance } from "../api/Governance"
import useProposal from "../hooks/useProposal"

import ContentLayout, { ContentSection } from "../components/Layout/ContentLayout"
import CategoryLabel from "../components/Category/CategoryLabel"
import StatusLabel from "../components/Status/StatusLabel"
import ForumButton from "../components/Section/ForumButton"
import SubscribeButton from "../components/Section/SubscribeButton"
import ProposalResultSection from "../components/Section/ProposalResultSection"
import ProposalDetailSection from "../components/Section/ProposalDetailSection"
import useAuthContext from "decentraland-gatsby/dist/context/Auth/useAuthContext"
import { forumUrl } from "../entities/Proposal/utils"
import { Snapshot } from "../api/Snapshot"
import Markdown from "decentraland-gatsby/dist/components/Text/Markdown"
import { VoteRegisteredModal } from "../components/Modal/VoteRegisteredModal"
import { DeleteProposalModal } from "../components/Modal/DeleteProposalModal"
import useFormatMessage from "decentraland-gatsby/dist/hooks/useFormatMessage"
import locations from "../modules/locations"
import loader from "../modules/loader"
import { EnactProposalModal } from "../components/Modal/EnactProposalModal"
import { ProposalStatus } from "../entities/Proposal/types"
import ProposalHeaderPoi from "../components/Proposal/ProposalHeaderPoi"
import Head from "decentraland-gatsby/dist/components/Head/Head"
import { formatDescription } from "decentraland-gatsby/dist/components/Head/utils"

import './index.css'
import './proposal.css'

type ProposalPageOptions = {
  changing: boolean,
  confirmSubscription: boolean
  confirmDeletion: boolean
  confirmEnact: boolean
}

export default function ProposalPage() {
  const l = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [ location.search ])
  const [ options, patchOptions ] = usePatchState<ProposalPageOptions>({ changing: false, confirmSubscription: false, confirmDeletion: false, confirmEnact: false })
  const [ account, { provider } ] = useAuthContext()
  const [ proposal, proposalState ] = useProposal(params.get('id'))
  const [ committee ] = useAsyncMemo(() => Governance.get().getCommittee(), [])
  const [ votes, votesState ] = useAsyncMemo(() => Governance.get().getProposalVotes(proposal!.id), [ proposal ], { callWithTruthyDeps: true })
  const [ subscriptions, subscriptionsState ] = useAsyncMemo(() => Governance.get().getSubscriptions(proposal!.id), [ proposal ], { callWithTruthyDeps: true })
  const [ votingPower, votingPowerState ] = useAsyncMemo(() => proposal!.status === ProposalStatus.Active ? Governance.get().getVotingPower(proposal!.id) : Promise.resolve(0), [ proposal ], { callWithTruthyDeps: true })
  const subscribed = useMemo(() => !!account && !!subscriptions && !!subscriptions.find(sub => sub.user === account), [ account, subscriptions ])
  const [ voting, vote] = useAsyncTask(async (_: string, choiceIndex: number) => {
    if (proposal && account && provider && votes) {
      const message = await Snapshot.get().createVoteMessage(proposal.snapshot_space, proposal.snapshot_id, choiceIndex)
      const signature = await new Personal(provider).sign(message, Address.fromString(account), '')
      await Snapshot.get().send(account, message, signature)
      patchOptions({ changing: false, confirmSubscription: !votes[account] })
      votesState.reload()
    }
  })

  const [ subscribing, subscribe ] = useAsyncTask(async () => {
    if (proposal) {
      if (subscribed) {
        await Governance.get().unsubscribe(proposal.id)
        subscriptionsState.set((current) => (current || []).filter(subscription => subscription.proposal_id !== proposal.id))
      } else {
        const newSubscription = await Governance.get().subscribe(proposal.id)
        subscriptionsState.set((current) => [ ...(current || []), newSubscription ])
      }

      patchOptions({ confirmSubscription: false})
    }
  })

  const [ deleting, deleteProposal ] = useAsyncTask(async () => {
    if (proposal && account && proposal.user === account) {
      await Governance.get().deleteProposal(proposal.id)
      navigate(locations.proposals())
    }
  })

  const [ enacting, enactProposal ] = useAsyncTask(async (description: string) => {
    if (proposal && account && committee && committee.includes(account)) {
      const updateProposal = await Governance.get().enactProposal(proposal.id, description)
      loader.proposals.set(proposal.id, updateProposal)
      patchOptions({ confirmEnact: false})
    }
  })

  return <>
  <Head
    title={proposal?.title || l('page.proposal_detail.title') || ''}
    description={(proposal?.description && formatDescription(proposal?.description)) || l('page.proposal_detail.description') || ''}
    image="https://decentraland.org/images/decentraland.png"
  />
  <ContentLayout className="ProposalDetailPage">
  <ContentSection>
    <Header size="huge">{proposal?.title || '' } &nbsp;</Header>
    <Loader active={!proposal}/>
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
        <Markdown source={proposal?.description || ''} />
      </Grid.Column>

      <Grid.Column tablet="4" className="ProposalDetailActions">
        <ForumButton loading={proposalState.loading} disabled={!proposal} href={proposal && forumUrl(proposal) || ''} />
        <SubscribeButton
          loading={proposalState.loading || subscriptionsState.loading || subscribing}
          disabled={!proposal}
          subscribed={subscribed}
          onClick={() => subscribe()}
        />
        <ProposalResultSection
          disabled={!proposal || !votes}
          loading={voting || proposalState.loading || votesState.loading || votingPowerState.loading}
          proposal={proposal}
          votes={votes}
          votingPower={votingPower || 0}
          changingVote={options.changing}
          onChangeVote={(_, changing) => patchOptions({ changing })}
          onVote={(_, choice, choiceIndex) => vote(choice, choiceIndex)}
        />
        <ProposalDetailSection proposal={proposal}/>
        {proposal && account && proposal.user === account && <Button style={{ width: '100%' }} basic loading={deleting} disabled={![ProposalStatus.Pending, ProposalStatus.Active].includes(proposal.status)} onClick={() => patchOptions({ confirmDeletion: true })}>{l('page.proposal_detail.delete')}</Button>}
        {proposal && account && committee && committee.includes(account) && <Button style={{ width: '100%' }} basic loading={enacting} disabled={![ProposalStatus.Finished, ProposalStatus.Passed].includes(proposal.status)} onClick={() => patchOptions({ confirmEnact: true })}>{l('page.proposal_detail.enact')}</Button>}
      </Grid.Column>
      </Grid.Row>
    </Grid>
  </ContentLayout>
  <VoteRegisteredModal open={options.confirmSubscription} subscribing={subscribing} onClickAccept={() => subscribe()} onClose={() => patchOptions({ confirmSubscription: false })}/>
  <DeleteProposalModal open={options.confirmDeletion} deleting={deleting} onClickAccept={() => deleteProposal()} onClose={() => patchOptions({ confirmDeletion: false })}/>
  <EnactProposalModal open={options.confirmEnact} enacting={enacting} onClickAccept={(_, description) => enactProposal(description)} onClose={() => patchOptions({ confirmEnact: false })}/>
  </>
}
