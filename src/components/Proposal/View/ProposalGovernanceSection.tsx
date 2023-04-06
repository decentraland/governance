import React, { useEffect, useState } from 'react'

import useAuth from 'decentraland-gatsby/dist/hooks/useAuth'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { ProposalAttributes, ProposalStatus, ProposalType } from '../../../entities/Proposal/types'
import { SelectedVoteChoice, Vote } from '../../../entities/Votes/types'
import { ProposalPageState } from '../../../pages/proposal'
import ChoiceProgress, { ChoiceProgressProps } from '../../Status/ChoiceProgress'

import ProposalVotingSection from './ProposalVoting/ProposalVotingSection'

import './DetailsSection.css'
import './ProposalGovernanceSection.css'
import ProposalPromotionSection from './ProposalPromotionSection'
import SidebarHeaderLabel from './SidebarHeaderLabel'

const PROMOTABLE_PROPOSALS = [ProposalType.Poll, ProposalType.Draft]

type ProposalGovernanceSectionProps = {
  proposal?: ProposalAttributes | null
  votes?: Record<string, Vote> | null
  partialResults: ChoiceProgressProps[]
  choices: string[]
  loading?: boolean
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
}: ProposalGovernanceSectionProps) {
  const t = useFormatMessage()
  const now = Time.utc()
  const finishAt = Time.utc(proposal?.finish_at)
  const finished = finishAt.isBefore(now)
  const [showResults, setShowResults] = useState(finished)
  const [userAddress] = useAuth()
  const hasVoted = !!(!!userAddress && votes?.[userAddress])
  const showResultsButton = !hasVoted && !finished
  const showPromotionSection =
    proposal && proposal.status === ProposalStatus.Passed && PROMOTABLE_PROPOSALS.includes(proposal.type)

  useEffect(() => {
    setShowResults(hasVoted || finished || !userAddress)
  }, [hasVoted, finished, userAddress])

  return (
    <div
      className={TokenList.join([
        'DetailsSection',
        disabled && 'DetailsSection--disabled',
        loading && 'DetailsSection--loading',
      ])}
    >
      <div>
        <div className="ProposalGovernanceSection__Container">
          <div className="ProposalGovernanceSection__Header">
            <SidebarHeaderLabel>
              {showResults ? t('page.proposal_detail.result_label') : t('page.proposal_detail.get_involved')}
            </SidebarHeaderLabel>
            {showResultsButton && (
              <button
                className="ProposalGovernanceSection__ResultsButton"
                onClick={() => setShowResults((prevState) => !prevState)}
              >
                {!showResults ? t('page.proposal_detail.show_results') : t('page.proposal_detail.hide_results')}
              </button>
            )}
          </div>
        </div>
        {showResults && (
          <div
            className={TokenList.join([
              'ProposalGovernanceSection__Results',
              !finished && 'ProposalGovernanceSection__Results--current',
            ])}
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
