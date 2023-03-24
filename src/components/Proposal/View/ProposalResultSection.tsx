import React, { useEffect, useState } from 'react'

import useAuth from 'decentraland-gatsby/dist/hooks/useAuth'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { SelectedVoteChoice, Vote } from '../../../entities/Votes/types'
import { ProposalPageState } from '../../../pages/proposal'
import ChoiceProgress, { ChoiceProgressProps } from '../../Status/ChoiceProgress'

import ProposalVotingSection from './ProposalVoting/ProposalVotingSection'

import './DetailsSection.css'
import ProposalPromotionSection from './ProposalPromotionSection'
import './ProposalResultSection.css'
import SidebarHeaderLabel from './SidebarHeaderLabel'

interface Props {
  choices: string[]
  results: ChoiceProgressProps[]
  proposal?: ProposalAttributes | null
  votes?: Record<string, Vote> | null
  loading?: boolean
  disabled?: boolean
  castingVote: boolean
  proposalPageState: ProposalPageState
  updatePageState: (newState: Partial<ProposalPageState>) => void
  onChangeVote?: (e: React.MouseEvent<unknown>, changing: boolean) => void
  onOpenVotesList?: () => void
  onVote: (selectedChoice: SelectedVoteChoice) => void
}

function ProposalResultSection({
  choices,
  results,
  proposal,
  loading,
  disabled,
  votes,
  castingVote,
  proposalPageState,
  updatePageState,
  onChangeVote,
  onVote,
  onOpenVotesList,
}: Props) {
  const t = useFormatMessage()
  const now = Time.utc()
  const finishAt = Time.utc(proposal?.finish_at)
  const finished = finishAt.isBefore(now)
  const [showResults, setShowResults] = useState(finished)
  const [userAddress] = useAuth()
  const hasVoted = !!(!!userAddress && votes?.[userAddress])
  const showResultsButton = !hasVoted && !finished

  useEffect(() => {
    setShowResults(hasVoted || finished)
  }, [hasVoted, finished])

  return (
    <div
      className={TokenList.join([
        'DetailsSection',
        disabled && 'DetailsSection--disabled',
        loading && 'DetailsSection--loading',
      ])}
    >
      <div>
        <div className="ProposalResultSection__Container">
          <div className="ProposalResultSection__Header">
            <SidebarHeaderLabel>
              {showResults ? t('page.proposal_detail.result_label') : t('page.proposal_detail.get_involved')}
            </SidebarHeaderLabel>
            {showResultsButton && (
              <button
                className="ProposalResultSection__ResultsButton"
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
              'ProposalResultSection__Results',
              !finished && 'ProposalResultSection__Results--current',
            ])}
          >
            {results.map((result) => {
              return (
                <ChoiceProgress
                  onClick={onOpenVotesList}
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
        <ProposalPromotionSection proposal={proposal} loading={loading} />
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
          proposalPageState={proposalPageState}
          updatePageState={updatePageState}
          onChangeVote={onChangeVote}
          hasVoted={hasVoted}
          isShowingResults={showResults}
        />
      )}
    </div>
  )
}

export default ProposalResultSection
