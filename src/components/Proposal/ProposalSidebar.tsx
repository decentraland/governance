import { useMemo, useState } from 'react'

import { SegmentEvent } from '../../entities/Events/types'
import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import { isProjectProposal } from '../../entities/Proposal/utils'
import { SubscriptionAttributes } from '../../entities/Subscription/types'
import { Survey } from '../../entities/SurveyTopic/types'
import { UpdateAttributes } from '../../entities/Updates/types'
import { isProposalStatusWithUpdates } from '../../entities/Updates/utils'
import { SelectedVoteChoice, VoteByAddress } from '../../entities/Votes/types'
import { calculateResult } from '../../entities/Votes/utils'
import { useAuthContext } from '../../front/context/AuthProvider'
import useAnalyticsTrack from '../../hooks/useAnalyticsTrack'
import useProposalChoices from '../../hooks/useProposalChoices'
import useProposalVotes from '../../hooks/useProposalVotes'
import { ProposalPageState } from '../../pages/proposal'
import { NotDesktop1200 } from '../Layout/Desktop1200'
import CalendarAlertModal from '../Modal/CalendarAlertModal'
import VotesListModal from '../Modal/Votes/VotesListModal'

import CalendarAlertButton from './View/CalendarAlertButton'
import ProposalCoAuthorStatus from './View/ProposalCoAuthorStatus'
import ProposalDetailSection from './View/ProposalDetailSection'
import ProposalGovernanceSection from './View/ProposalGovernanceSection'
import ProposalThresholdsSummary from './View/ProposalThresholdsSummary'
import ProposalUpdatesActions from './View/ProposalUpdatesActions'
import SubscribeButton from './View/SubscribeButton'
import VestingContract from './View/VestingContract'

import ProposalActions from './ProposalActions'
import './ProposalSidebar.css'

interface Props {
  proposal: ProposalAttributes | null
  proposalLoading: boolean
  proposalPageState: ProposalPageState
  updatePageState: React.Dispatch<React.SetStateAction<ProposalPageState>>
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
  votes?: VoteByAddress | null
  isOwner: boolean
  isCoauthor: boolean
  shouldGiveReason?: boolean
  votingSectionRef: React.MutableRefObject<HTMLDivElement | null>
}

export default function ProposalSidebar({
  proposal,
  proposalLoading,
  proposalPageState,
  updatePageState,
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
  isOwner,
  isCoauthor,
  shouldGiveReason,
  votingSectionRef,
}: Props) {
  const [account] = useAuthContext()
  const subscribed = useMemo(
    () => !!account && !!subscriptions && !!subscriptions.find((sub) => sub.user === account),
    [account, subscriptions]
  )
  const { votes, isLoadingVotes, segmentedVotes } = useProposalVotes(proposal?.id)
  const { highQualityVotes, lowQualityVotes } = segmentedVotes || {}
  const choices = useProposalChoices(proposal)
  const partialResults = useMemo(() => calculateResult(choices, highQualityVotes || {}), [choices, highQualityVotes])

  const [isVotesListModalOpen, setIsVotesListModalOpen] = useState(false)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const track = useAnalyticsTrack()
  const setIsCalendarModalOpenWithTracking = (isOpen: boolean) => {
    setIsCalendarModalOpen(isOpen)
    if (isOpen) {
      track(SegmentEvent.ModalViewed, { address: account, modal: 'Calendar Alert' })
    }
  }

  const handleVoteClick = (selectedChoice: SelectedVoteChoice) => {
    if (voteWithSurvey || shouldGiveReason) {
      updatePageState((prevState) => ({
        ...prevState,
        selectedChoice,
        showVotingModal: true,
      }))
    } else if (voteOnBid) {
      updatePageState((prevState) => ({
        ...prevState,
        selectedChoice,
        showBidVotingModal: true,
      }))
    } else {
      castVote(selectedChoice)
    }
  }

  const handleChoiceClick = () => {
    setIsVotesListModalOpen(true)
  }

  const showProposalUpdatesActions =
    proposal &&
    isProposalStatusWithUpdates(proposal?.status) &&
    isProjectProposal(proposal?.type) &&
    (isOwner || isCoauthor)
  const showProposalThresholdsSummary = !!(
    proposal &&
    proposal?.required_to_pass !== null &&
    proposal?.required_to_pass >= 0 &&
    proposal.status !== ProposalStatus.Pending &&
    !(proposal.status === ProposalStatus.Passed)
  )

  const showVestingContract = proposal?.vesting_addresses && proposal?.vesting_addresses.length > 0
  const isCalendarButtonDisabled = !proposal || proposal.status !== ProposalStatus.Active

  return (
    <>
      {showVestingContract && <VestingContract vestingAddresses={proposal.vesting_addresses} />}
      {proposal && <ProposalCoAuthorStatus proposalId={proposal.id} proposalFinishDate={proposal.finish_at} />}
      <div className="ProposalSidebar">
        {showProposalUpdatesActions && (
          <ProposalUpdatesActions
            nextUpdate={nextUpdate}
            currentUpdate={currentUpdate}
            pendingUpdates={pendingUpdates}
            proposal={proposal}
          />
        )}
        <div ref={votingSectionRef}>
          <ProposalGovernanceSection
            disabled={!proposal || !votes}
            loading={proposalLoading || isLoadingVotes}
            proposal={proposal}
            votes={votes}
            partialResults={partialResults}
            choices={choices}
            voteWithSurvey={voteWithSurvey}
            castingVote={castingVote}
            onChangeVote={(_, changing) => updatePageState((prevState) => ({ ...prevState, changingVote: changing }))}
            onVote={handleVoteClick}
            onChoiceClick={handleChoiceClick}
            updatePageState={updatePageState}
            proposalPageState={proposalPageState}
          />
        </div>
        {showProposalThresholdsSummary && (
          <ProposalThresholdsSummary proposal={proposal} partialResults={partialResults} />
        )}
        <SubscribeButton
          loading={proposalLoading || subscriptionsLoading || subscribing}
          disabled={!proposal}
          subscribed={subscribed}
          onClick={() => subscribe(!subscribed)}
        />
        <CalendarAlertButton
          loading={proposalLoading}
          disabled={isCalendarButtonDisabled}
          onClick={() => setIsCalendarModalOpenWithTracking(true)}
        />
        {proposal && (
          <>
            <NotDesktop1200>
              <ProposalDetailSection proposal={proposal} />
            </NotDesktop1200>
            <ProposalActions proposal={proposal} />
            <CalendarAlertModal
              proposal={proposal}
              open={isCalendarModalOpen}
              onClose={() => setIsCalendarModalOpenWithTracking(false)}
            />
            <VotesListModal
              open={isVotesListModalOpen}
              proposal={proposal}
              highQualityVotes={highQualityVotes}
              lowQualityVotes={lowQualityVotes}
              onClose={() => setIsVotesListModalOpen(false)}
            />
          </>
        )}
      </div>
    </>
  )
}
