import React, { useMemo } from 'react'

import Anchor from 'decentraland-gatsby/dist/components/Text/Link'
import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import { Vote } from '../../entities/Votes/types'
import { calculateResult } from '../../entities/Votes/utils'
import ChoiceProgress from '../Status/ChoiceProgress'

import './DetailsSection.css'
import { ProposalPromotionSection } from './ProposalPromotionSection'
import ProposalVotingSection from './ProposalVoting/ProposalVotingSection'
import VotingStatusSummary from './VotingStatusSummary'

export type ProposalResultSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null
  votes?: Record<string, Vote> | null
  votingPower?: number
  loading?: boolean
  disabled?: boolean
  changingVote?: boolean
  onChangeVote?: (e: React.MouseEvent<any>, changing: boolean) => void
  onOpenVotesList?: () => void
  onVote?: (e: React.MouseEvent<any>, choice: string, choiceIndex: number) => void
}

export default function ProposalResultSection({
  proposal,
  loading,
  disabled,
  votes,
  changingVote,
  votingPower,
  onChangeVote,
  onVote,
  onOpenVotesList,
  ...props
}: ProposalResultSectionProps) {
  const t = useFormatMessage()
  const choices = proposal?.snapshot_proposal?.choices || []
  const results = useMemo(() => calculateResult(choices, votes || {}), [proposal, choices, votes])
  const now = Time.utc()
  const startAt = Time.utc(proposal?.start_at) || now
  const finishAt = Time.utc(proposal?.finish_at) || now
  const untilStart = useCountdown(startAt)
  const untilFinish = useCountdown(finishAt)
  const started = untilStart.time === 0
  const finished = untilFinish.time === 0
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
          votes={votes}
          loading={loading}
          changingVote={changingVote}
          choices={choices}
          started={started}
          finished={finished}
          onVote={onVote}
          onChangeVote={onChangeVote}
        />
      )}
    </div>
  )
}
