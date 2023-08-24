import React, { useMemo, useState } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { ProposalAttributes, ProposalStatus, ProposalType } from '../../entities/Proposal/types'
import { SubscriptionAttributes } from '../../entities/Subscription/types'
import { Survey } from '../../entities/SurveyTopic/types'
import { UpdateAttributes } from '../../entities/Updates/types'
import { isProposalStatusWithUpdates } from '../../entities/Updates/utils'
import { SelectedVoteChoice, Vote } from '../../entities/Votes/types'
import { calculateResult } from '../../entities/Votes/utils'
import { ProposalPageState } from '../../pages/proposal'
import CalendarAlertModal from '../Modal/CalendarAlertModal'

import CalendarAlertButton from './View/CalendarAlertButton'
import ForumButton from './View/ForumButton'
import ProposalCoAuthorStatus from './View/ProposalCoAuthorStatus'
import ProposalDetailSection from './View/ProposalDetailSection'
import ProposalGovernanceSection from './View/ProposalGovernanceSection'
import ProposalThresholdsSummary from './View/ProposalThresholdsSummary'
import ProposalUpdatesActions from './View/ProposalUpdatesActions'
import SubscribeButton from './View/SubscribeButton'
import VestingContract from './View/VestingContract'

import ProposalActions from './ProposalActions'
import './ProposalSidebar.css'

const EMPTY_VOTE_CHOICES: string[] = []

type Props = {
  proposal: ProposalAttributes | null
  proposalLoading: boolean
  deleting: boolean
  proposalPageState: ProposalPageState
  updatePageState: (newState: Partial<ProposalPageState>) => void
  pendingUpdates?: UpdateAttributes[]
  nextUpdate?: UpdateAttributes
  currentUpdate?: UpdateAttributes | null
  castingVote: boolean
  castVote: (selectedChoice: SelectedVoteChoice, survey?: Survey | undefined) => void
  voteWithSurvey: boolean
  voteOnBid: boolean
  subscribing: boolean
  subscribe: (subscribe: boolean) => void
  subscriptions: SubscriptionAttributes[] | null
  subscriptionsLoading: boolean
  votes: Record<string, Vote> | null
  votesLoading: boolean
  highQualityVotes: Record<string, Vote> | null
  isOwner: boolean
  isCoauthor: boolean
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
  castingVote,
  castVote,
  voteWithSurvey,
  voteOnBid,
  subscribing,
  subscribe,
  subscriptions,
  subscriptionsLoading,
  highQualityVotes,
  votes,
  votesLoading,
  isOwner,
  isCoauthor,
}: Props) {
  const [account] = useAuthContext()
  const subscribed = useMemo(
    () => !!account && !!subscriptions && !!subscriptions.find((sub) => sub.user === account),
    [account, subscriptions]
  )
  const choices: string[] = proposal?.snapshot_proposal?.choices || EMPTY_VOTE_CHOICES
  const partialResults = useMemo(() => calculateResult(choices, highQualityVotes || {}), [choices, highQualityVotes])

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)

  const handleVoteClick = (selectedChoice: SelectedVoteChoice) => {
    if (voteWithSurvey) {
      updatePageState({
        selectedChoice: selectedChoice,
        showVotingModal: true,
      })
    } else if (voteOnBid) {
      updatePageState({
        selectedChoice: selectedChoice,
        showBidVotingModal: true,
      })
    } else {
      castVote(selectedChoice)
    }
  }

  const showProposalUpdatesActions =
    isProposalStatusWithUpdates(proposal?.status) && proposal?.type === ProposalType.Grant && (isOwner || isCoauthor)
  const showProposalThresholdsSummary = !!(
    proposal &&
    proposal?.required_to_pass !== null &&
    proposal?.required_to_pass >= 0 &&
    proposal.status !== ProposalStatus.Pending &&
    !(proposal.status === ProposalStatus.Passed)
  )

  const showVestingContract = proposal?.vesting_addresses && proposal?.vesting_addresses.length > 0
  const showCalendarAlertButton = !!proposal && proposal.status === ProposalStatus.Active

  return (
    <>
      {showVestingContract && <VestingContract vestingAddresses={proposal.vesting_addresses} />}
      {proposal && <ProposalCoAuthorStatus proposalId={proposal.id} proposalFinishDate={proposal.finish_at} />}
      <div className="ProposalSidebar">
        {showProposalUpdatesActions && proposal && (
          <ProposalUpdatesActions
            nextUpdate={nextUpdate}
            currentUpdate={currentUpdate}
            pendingUpdates={pendingUpdates}
            proposal={proposal}
          />
        )}
        <ProposalGovernanceSection
          disabled={!proposal || !votes}
          loading={proposalLoading || votesLoading}
          proposal={proposal}
          votes={votes}
          partialResults={partialResults}
          choices={choices}
          voteWithSurvey={voteWithSurvey}
          castingVote={castingVote}
          onChangeVote={(_, changing) => updatePageState({ changingVote: changing })}
          onVote={handleVoteClick}
          updatePageState={updatePageState}
          proposalPageState={proposalPageState}
        />
        {showProposalThresholdsSummary && (
          <ProposalThresholdsSummary proposal={proposal} partialResults={partialResults} />
        )}
        <ForumButton loading={proposalLoading} proposal={proposal} />
        <SubscribeButton
          loading={proposalLoading || subscriptionsLoading || subscribing}
          disabled={!proposal}
          subscribed={subscribed}
          onClick={() => subscribe(!subscribed)}
        />
        {showCalendarAlertButton && (
          <CalendarAlertButton
            loading={proposalLoading}
            disabled={!proposal}
            onClick={() => setIsCalendarModalOpen(true)}
          />
        )}
        {proposal && <ProposalDetailSection proposal={proposal} />}
        {proposal && <ProposalActions proposal={proposal} deleting={deleting} updatePageState={updatePageState} />}
        {proposal && (
          <CalendarAlertModal
            proposal={proposal}
            open={isCalendarModalOpen}
            onClose={() => setIsCalendarModalOpen(false)}
          />
        )}
      </div>
    </>
  )
}
