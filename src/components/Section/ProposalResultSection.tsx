import React, { useMemo } from 'react'

import Anchor from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import { Vote } from '../../entities/Votes/types'
import { calculateResult } from '../../entities/Votes/utils'
import ChoiceProgress from '../Status/ChoiceProgress'

import ProposalVotingSection from './ProposalVoting/ProposalVotingSection'

import './DetailsSection.css'
import { ProposalPromotionSection } from './ProposalPromotionSection'
import VotingStatusSummary from './VotingStatusSummary'

export type ProposalResultSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null
  votes?: Record<string, Vote> | null
  loading?: boolean
  disabled?: boolean
  changingVote?: boolean
  onChangeVote?: (e: React.MouseEvent<unknown>, changing: boolean) => void
  onOpenVotesList?: () => void
  onVote?: (e: React.MouseEvent<unknown>, choice: string, choiceIndex: number) => void
}

const EMPTY_CHOICES: string[] = []

export default function ProposalResultSection({
  proposal,
  loading,
  disabled,
  votes,
  changingVote,
  onChangeVote,
  onVote,
  onOpenVotesList,
  ...props
}: ProposalResultSectionProps) {
  const t = useFormatMessage()
  const choices: string[] = proposal?.snapshot_proposal?.choices || EMPTY_CHOICES
  const results = useMemo(() => calculateResult(choices, votes || {}), [choices, votes])
  const now = Time.utc()
  const finishAt = Time.utc(proposal?.finish_at)
  const finished = finishAt.isBefore(now)
  const showVotingStatusSummary =
    proposal && !!proposal.required_to_pass && !(proposal.status === ProposalStatus.Passed)
  const showSeeVotesButton = useMemo(() => Object.keys(votes || {}).length > 0, [votes])

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
      <div className="DetailsSection__Content">
        <Loader active={loading} />
        <div className="DetailsSection__Flex_Header_Labels">
          <Header sub>{t('page.proposal_detail.result_label')}</Header>
          {showSeeVotesButton && (
            <Anchor onClick={onOpenVotesList}>{t('page.proposal_detail.see_votes_button')}</Anchor>
          )}
        </div>
        {results.map((result) => {
          return (
            <ChoiceProgress
              key={result.choice}
              color={result.color}
              choice={result.choice}
              votes={result.votes}
              power={result.power}
              progress={result.progress}
            />
          )
        })}
        <ProposalPromotionSection proposal={proposal} loading={loading} />
        {showVotingStatusSummary && <VotingStatusSummary proposal={proposal} votes={results} />}
      </div>
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
    </div>
  )
}
