import React, { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { forumUrl } from '../../entities/Proposal/utils'
import { SubscriptionAttributes } from '../../entities/Subscription/types'
import { Survey } from '../../entities/SurveyTopic/types'
import { UpdateAttributes } from '../../entities/Updates/types'
import { SelectedVoteChoice, Vote } from '../../entities/Votes/types'
import { ProposalPageState } from '../../pages/proposal'
import ForumButton from '../Section/ForumButton'
import ProposalCoAuthorStatus from '../Section/ProposalCoAuthorStatus'
import ProposalDetailSection from '../Section/ProposalDetailSection'
import ProposalGovernanceSection from '../Section/ProposalGovernanceSection'
import ProposalUpdatesActions from '../Section/ProposalUpdatesActions'
import SubscribeButton from '../Section/SubscribeButton'
import VestingContract from '../Section/VestingContract'
import { ChoiceProgressProps } from '../Status/ChoiceProgress'

import ProposalActions from './ProposalActions'
import './ProposalSidebar.css'

type ProposalSidebarProps = {
  proposal: ProposalAttributes | null
  proposalLoading: boolean
  deleting: boolean
  proposalPageState: ProposalPageState
  updatePageState: (newState: Partial<ProposalPageState>) => void
  pendingUpdates?: UpdateAttributes[]
  nextUpdate?: UpdateAttributes
  currentUpdate?: UpdateAttributes | null
  handleScrollClick: () => void
  castingVote: boolean
  castVote: (selectedChoice: SelectedVoteChoice, survey?: Survey | undefined) => void
  showSurvey: boolean
  updatingStatus: boolean
  subscribing: boolean
  subscribe: (subscribe?: boolean) => void
  subscriptions: SubscriptionAttributes[] | null
  subscriptionsLoading: boolean
  partialResults: ChoiceProgressProps[]
  votes: Record<string, Vote> | null
  votesLoading: boolean
  choices: string[]
}

export default function ProposalSidebar({
  proposal,
  proposalLoading,
  proposalPageState,
  updatePageState,
  deleting,
  pendingUpdates,
  nextUpdate,
  currentUpdate,
  handleScrollClick,
  castingVote,
  castVote,
  showSurvey,
  updatingStatus,
  subscribing,
  subscribe,
  subscriptions,
  subscriptionsLoading,
  partialResults,
  votes,
  votesLoading,
  choices,
}: ProposalSidebarProps) {
  const [account] = useAuthContext()
  const subscribed = useMemo(
    () => !!account && !!subscriptions && !!subscriptions.find((sub) => sub.user === account),
    [account, subscriptions]
  )

  const handleVoteClick = (selectedChoice: SelectedVoteChoice) => {
    if (showSurvey) {
      updatePageState({
        selectedChoice: selectedChoice,
        showVotingModal: true,
      })
    } else {
      castVote(selectedChoice)
    }
  }

  return (
    <>
      {!!proposal?.vesting_address && <VestingContract vestingAddress={proposal.vesting_address} />}
      {proposal && <ProposalCoAuthorStatus proposalId={proposal.id} proposalFinishDate={proposal.finish_at} />}
      <div className="ProposalSidebar">
        <ProposalUpdatesActions
          nextUpdate={nextUpdate}
          currentUpdate={currentUpdate}
          pendingUpdates={pendingUpdates}
          proposal={proposal}
        />
        <ProposalGovernanceSection
          disabled={!proposal || !votes}
          loading={proposalLoading || votesLoading}
          proposal={proposal}
          votes={votes}
          partialResults={partialResults}
          choices={choices}
          castingVote={castingVote}
          onChangeVote={(_, changing) => updatePageState({ changingVote: changing })}
          onVote={handleVoteClick}
          updatePageState={updatePageState}
          proposalPageState={proposalPageState}
          handleScrollTo={handleScrollClick}
        />
        <ForumButton loading={proposalLoading} disabled={!proposal} href={(proposal && forumUrl(proposal)) || ''} />
        <SubscribeButton
          loading={proposalLoading || subscriptionsLoading || subscribing}
          disabled={!proposal}
          subscribed={subscribed}
          onClick={() => subscribe(!subscribed)}
        />
        {proposal && <ProposalDetailSection proposal={proposal} />}
        {proposal && (
          <ProposalActions
            proposal={proposal}
            deleting={deleting}
            updatingStatus={updatingStatus}
            updatePageState={updatePageState}
          />
        )}
      </div>
    </>
  )
}
