import React, { useMemo } from 'react'
import { Link } from 'gatsby-plugin-intl'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import Anchor from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import Bold from 'decentraland-gatsby/dist/components/Text/Bold'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { ProposalAttributes, ProposalStatus } from '../../entities/Proposal/types'
import ChoiceProgress from '../Status/ChoiceProgress'
import ChoiceButton from './ChoiceButton'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import locations from '../../modules/locations'
import { Vote } from '../../entities/Votes/types'
import { calculateChoiceColor, calculateResult } from '../../entities/Votes/utils'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import './DetailsSection.css'
import { ProposalPromotionSection } from './ProposalPromotionSection'

export type ProposalResultSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null,
  votes?: Record<string, Vote> | null,
  votingPower?: number
  loading?: boolean,
  disabled?: boolean,
  changingVote?: boolean,
  onChangeVote?: (e: React.MouseEvent<any>, changing: boolean) => void,
  onOpenVotesList?: () => void,
  onVote?: (e: React.MouseEvent<any>, choice: string, choiceIndex: number) => void
}

export default React.memo(function ProposalResultSection({ proposal, loading, disabled, votes, changingVote, votingPower, onChangeVote, onVote, onOpenVotesList, ...props }: ProposalResultSectionProps) {
  const l = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const choices = useMemo((): string[] => proposal?.snapshot_proposal?.choices || [], [proposal])
  const vote = useMemo(() => account && votes && votes[account] && votes[account] || null, [account, votes])
  const results = useMemo(() => calculateResult(choices, votes || {} /*, proposal?.required_to_pass || 0*/), [proposal, choices, votes])
  const now = useMemo(() => Time.utc(), [])
  const start_at = useMemo(() => Time.utc(proposal?.start_at) || now, [proposal])
  const finish_at = useMemo(() => Time.utc(proposal?.finish_at) || now, [proposal])
  const isVotes = useMemo(() => Object.keys(votes || {}).length > 0, [votes])
  const untilStart = useCountdown(start_at)
  const untilFinish = useCountdown(finish_at)
  const started = untilStart.time === 0
  const finished = untilFinish.time === 0

  return <div {...props} className={TokenList.join([
    'DetailsSection',
    disabled && 'DetailsSection--disabled',
    loading && 'DetailsSection--loading',
    'ResultSection',
    props.className
  ])}>
    <div className="DetailsSection__Content">
      <Loader active={loading} />
      <div className="DetailsSection__Flex_Header_Labels">
        <Header sub>{l('page.proposal_detail.result_label')}</Header>
        {isVotes && <Anchor onClick={onOpenVotesList}>
          {l('page.proposal_detail.see_votes_button')}
        </Anchor>}
      </div>
      {results.map((result) => {
        return <ChoiceProgress key={result.choice} color={result.color} choice={result.choice} votes={result.votes} power={result.power} progress={result.progress} />
      })}
      <ProposalPromotionSection proposal={proposal} loading={loading}/>
      {proposal && !!proposal.required_to_pass && !(proposal.status === ProposalStatus.Passed) &&
        <div className="DetailsSection__Secondary">
          <div className="DetailsSection__Secondary__Subtitle">
            {l('page.proposal_detail.required_vp')}
          </div>
          <div className="DetailsSection__Secondary__Title">
            {l('general.number', { value: proposal.required_to_pass  })} VP
          </div>
        </div>
      }
    </div>
    {!finished && <div className="DetailsSection__Content">
      <Loader active={!loading && accountState.loading} />

      {!account && <Button basic loading={accountState.loading} disabled={accountState.loading} onClick={() => accountState.select()}>
        {l('general.sign_in')}
      </Button>}

      {account && (!vote || changingVote) && choices.map((currentChoice, currentChoiceIndex) => {
        return <ChoiceButton
          key={currentChoice}
          choice={currentChoice}
          voted={vote?.choice === (currentChoiceIndex + 1)}
          disabled={vote?.choice === (currentChoiceIndex + 1) || !started || finished}
          color={calculateChoiceColor(currentChoice, currentChoiceIndex)}
          onClick={(e: React.MouseEvent<any>) => onVote && onVote(e, currentChoice, currentChoiceIndex + 1)}
        />
      })}
      {started && !finished && account && (!vote || changingVote) && <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          {l('page.proposal_detail.voting_with', {
            vp: <Bold>{l(`general.number`, { value: votingPower || 0 })} VP</Bold>,
          })}
        </div>
        <div>
          <Link to={locations.balance()}>{l('page.proposal_detail.vote_manage')}</Link>
        </div>
      </div>}

      {account && vote && !changingVote && <ChoiceButton disabled={!started || finished} choice={choices[vote.choice - 1]} color={calculateChoiceColor(choices[vote.choice - 1], vote.choice - 1)} voted={true} />}
    </div>}
    {started && !finished && account && vote && !changingVote && <Button basic onClick={(e) => onChangeVote && onChangeVote(e, true)}>{l('page.proposal_detail.vote_change')}</Button>}
    {started && !finished && account && vote && changingVote && <Button basic onClick={(e) => onChangeVote && onChangeVote(e, false)}>{l('general.cancel')}</Button>}
  </div>
})
