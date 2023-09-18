import React, { useEffect, useState } from 'react'

import classNames from 'classnames'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

import { ProposalAttributes, ProposalStatus, ProposalType } from '../../../entities/Proposal/types'
import { SelectedVoteChoice, Vote } from '../../../entities/Votes/types'
import { useBidProposals } from '../../../hooks/useBidProposals'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { useTenderProposals } from '../../../hooks/useTenderProposals'
import { ProposalPageState } from '../../../pages/proposal'
import Time from '../../../utils/date/Time'
import ChoiceProgress, { ChoiceProgressProps } from '../../Status/ChoiceProgress'

import ProposalVotingSection from './ProposalVoting/ProposalVotingSection'

import './DetailsSection.css'
import './ProposalGovernanceSection.css'
import ProposalPromotionSection from './ProposalPromotionSection'
import SidebarHeaderLabel from './SidebarHeaderLabel'

const PROMOTABLE_PROPOSALS = [ProposalType.Poll, ProposalType.Draft, ProposalType.Pitch, ProposalType.Tender]

interface Props {
  proposal?: ProposalAttributes | null
  votes?: Record<string, Vote> | null
  partialResults: ChoiceProgressProps[]
  choices: string[]
  loading: boolean
  disabled?: boolean
  onChangeVote?: (e: React.MouseEvent<unknown>, changing: boolean) => void
  voteWithSurvey: boolean
  onVote: (selectedChoice: SelectedVoteChoice) => void
  castingVote: boolean
  proposalPageState: ProposalPageState
  updatePageState: (newState: Partial<ProposalPageState>) => void
}

export default function ProposalGovernanceSection({
  proposal,
  loading,
  disabled,
  votes,
  partialResults,
  choices,
  onChangeVote,
  onVote,
  castingVote,
  voteWithSurvey,
  proposalPageState,
  updatePageState,
}: Props) {
  const t = useFormatMessage()
  const now = Time.utc()
  const finishAt = Time.utc(proposal?.finish_at)
  const finished = finishAt.isBefore(now)
  const [showResults, setShowResults] = useState(finished)
  const [userAddress] = useAuthContext()
  const hasVoted = !!(!!userAddress && votes?.[userAddress])
  const showResultsButton = !hasVoted && !finished && proposal?.status !== ProposalStatus.Pending
  const { hasTenderProcessStarted } = useTenderProposals(proposal?.id, proposal?.type)
  const { bidProposals } = useBidProposals(proposal?.id, proposal?.type)
  const showPromotionSection =
    proposal &&
    proposal.status === ProposalStatus.Passed &&
    PROMOTABLE_PROPOSALS.includes(proposal.type) &&
    !hasTenderProcessStarted &&
    Number(bidProposals?.total) === 0

  useEffect(() => {
    setShowResults(hasVoted || finished || !userAddress)
  }, [hasVoted, finished, userAddress])

  return (
    <div
      className={classNames(
        'DetailsSection',
        'DetailsSection--with-shadow',
        disabled && 'DetailsSection--disabled',
        loading && 'DetailsSection--loading',
        showPromotionSection && 'DetailsSection--shiny'
      )}
    >
      <div>
        <div className="ProposalGovernanceSection__Container">
          <div className="ProposalGovernanceSection__Header">
            <SidebarHeaderLabel>
              {showResults ? t('page.proposal_detail.result_label') : t('page.proposal_detail.get_involved')}
            </SidebarHeaderLabel>
            {showResultsButton && (
              <a
                className="ProposalGovernanceSection__ResultsButton"
                onClick={() => setShowResults((prevState) => !prevState)}
                href={proposal?.type !== ProposalType.Poll ? '#ProposalVPChart' : undefined}
              >
                {!showResults ? t('page.proposal_detail.show_results') : t('page.proposal_detail.hide_results')}
              </a>
            )}
          </div>
        </div>
        {showResults && (
          <div
            className={classNames(
              'ProposalGovernanceSection__Results',
              !finished && 'ProposalGovernanceSection__Results--current'
            )}
          >
            {partialResults.map((result) => {
              return (
                <ChoiceProgress
                  onClick={() => updatePageState({ showVotesList: true })}
                  key={result.choice}
                  color={result.color}
                  choice={result.choice}
                  votes={result.votes}
                  power={result.power}
                  progress={result.progress}
                />
              )
            })}
          </div>
        )}
        {showPromotionSection && <ProposalPromotionSection proposal={proposal} loading={loading} />}
      </div>

      {!finished && (
        <ProposalVotingSection
          proposal={proposal}
          votes={votes}
          loading={loading}
          choices={choices}
          finished={finished}
          onVote={onVote}
          castingVote={castingVote}
          voteWithSurvey={voteWithSurvey}
          isShowingResults={showResults}
          proposalPageState={proposalPageState}
          updatePageState={updatePageState}
          onChangeVote={onChangeVote}
          hasVoted={hasVoted}
        />
      )}
    </div>
  )
}
