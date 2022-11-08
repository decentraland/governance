import React from 'react'

import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { Vote } from '../../entities/Votes/types'

import ProposalVotingSection from './ProposalVoting/ProposalVotingSection'

import './DetailsSection.css'
import ProposalResultsSection from './ProposalResultsSection'

export type ProposalGovernanceSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null
  votes?: Record<string, Vote> | null
  loading?: boolean
  disabled?: boolean
  changingVote?: boolean
  onChangeVote?: (e: React.MouseEvent<unknown>, changing: boolean) => void
  onOpenVotesList?: () => void
  onVote: (choice: string, choiceIndex: number) => void
}

const EMPTY_CHOICES: string[] = []

export default function ProposalGovernanceSection({
  proposal,
  loading,
  disabled,
  votes,
  changingVote,
  onChangeVote,
  onVote,
  onOpenVotesList,
  ...props
}: ProposalGovernanceSectionProps) {
  const choices: string[] = proposal?.snapshot_proposal?.choices || EMPTY_CHOICES
  const now = Time.utc()
  const finishAt = Time.utc(proposal?.finish_at)
  const finished = finishAt.isBefore(now)

  //TODO: DetailsSection should be called ProposalSidebar section or smth
  return (
    <div
      {...props}
      className={TokenList.join([
        'DetailsSection',
        disabled && 'DetailsSection--disabled',
        loading && 'DetailsSection--loading',
        'ResultSection',
        props.className,
      ])}
    >
      {!finished && (
        <ProposalVotingSection
          proposal={proposal}
          votes={votes}
          loading={loading}
          changingVote={changingVote}
          choices={choices}
          finished={finished}
          onVote={onVote}
          onChangeVote={onChangeVote}
        />
      )}
      <ProposalResultsSection proposal={proposal} votes={votes} loading={loading} onOpenVotesList={onOpenVotesList} />
    </div>
  )
}
