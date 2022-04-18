import React, { useMemo } from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import Anchor from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import ChoiceProgress from '../Status/ChoiceProgress'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Vote } from '../../entities/Votes/types'
import { calculateResult } from '../../entities/Votes/utils'
import { ProposalPromotionSection } from './ProposalPromotionSection'
import VotingStatusSummary from './VotingStatusSummary'
import ProposalVotingSection from './ProposalVotingSection'
import './DetailsSection.css'

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

export default React.memo(function ProposalResultSection({
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
  const [account, accountState] = useAuthContext()
  const choices = useMemo((): string[] => proposal?.snapshot_proposal?.choices || [], [proposal])
  const vote = useMemo(() => (account && votes && votes[account] && votes[account]) || null, [account, votes])
  const results = useMemo(() => calculateResult(choices, votes || {}), [proposal, choices, votes])
  const now = useMemo(() => Time.utc(), [])
  const startAt = useMemo(() => Time.utc(proposal?.start_at) || now, [proposal])
  const finishAt = useMemo(() => Time.utc(proposal?.finish_at) || now, [proposal])
  const untilStart = useCountdown(startAt)
  const untilFinish = useCountdown(finishAt)
  const started = untilStart.time === 0
  const finished = untilFinish.time === 0
  const showVotingStatusSummary =
    proposal && !!proposal.required_to_pass && !(proposal.status === ProposalStatus.Passed)
  const hasUserVoted = account && vote
  const isVotingOpen = started && !finished
  const showChangeVoteButton = isVotingOpen && hasUserVoted && !changingVote
  const showCancelChangeVoteButton = isVotingOpen && hasUserVoted && changingVote
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
          vote={vote}
          votes={votes}
          loading={loading}
          account={account}
          accountStateLoading={accountState.loading}
          accountStateSelect={accountState.select}
          changingVote={changingVote}
          choices={choices}
          started={started}
          onVote={onVote}
          votingPower={votingPower}
        />
      )}
      {showChangeVoteButton && (
        <Button basic onClick={(e) => onChangeVote && onChangeVote(e, true)}>
          {t('page.proposal_detail.vote_change')}
        </Button>
      )}
      {showCancelChangeVoteButton && (
        <Button basic onClick={(e) => onChangeVote && onChangeVote(e, false)}>
          {t('general.cancel')}
        </Button>
      )}
    </div>
  )
})
