import React, { useMemo } from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import Bold from 'decentraland-gatsby/dist/components/Text/Bold'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { ProposalAttributes } from '../../entities/Proposal/types'
import ChoiceProgress from '../Status/ChoiceProgress'
import ChoiceButton from './ChoiceButton'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Link } from 'gatsby-plugin-intl'
import locations from '../../modules/locations'
import { Vote } from '../../entities/Votes/types'
import { calculateChoiceColor, calculateResult } from '../../entities/Votes/utils'

export type ProposalResultSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null,
  votes?: Record<string, Vote> | null,
  votingPower?: number
  loading?: boolean,
  disabled?: boolean,
  changingVote?: boolean,
  onChangeVote?: (e: React.MouseEvent<any>, changing: boolean) => void,
  onVote?: (e: React.MouseEvent<any>, choice: string, choiceIndex: number) => void
}

export default React.memo(function ProposalResultSection({ proposal, loading, disabled, votes, changingVote, votingPower, onChangeVote, onVote, ...props }: ProposalResultSectionProps) {
  const l = useFormatMessage()
  const [ account, accountState ] = useAuthContext()
  const choices = useMemo((): string[] => proposal?.snapshot_proposal?.choices || [], [ proposal ])
  const vote = useMemo(() => account && votes && votes[account] && votes[account] || null, [ account, votes ])
  const results = useMemo(() => calculateResult(choices, votes || {}), [ choices, votes ])
  const now = useMemo(() => new Date, [])
  const startAt = useCountdown(proposal?.start_at || now)
  const finishAt = useCountdown(proposal?.finish_at || now)
  const started = startAt.time === 0
  const finished = finishAt.time === 0

  return <div {...props} className={TokenList.join([
    'DetailsSection',
    disabled && 'DetailsSection--disabled',
    loading &&'DetailsSection--loading',
    'ResultSection',
    props.className
  ])}>
    <Loader active={loading} />
    <div>
      <Header sub>{l('page.proposal_detail.result_label')}</Header>
    </div>
    {results.map((result) => {
      return <ChoiceProgress key={result.choice} color={result.color} choice={result.choice} votes={result.votes} progress={result.progress} />
    })}
    {!finished && <div className="DetailsSection__Content">
      <Loader active={!loading && accountState.loading } />

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

      {account && vote && !changingVote && <ChoiceButton disabled={!started || finished} choice={choices[vote.choice -1]} color={calculateChoiceColor(choices[vote.choice -1], vote.choice -1)} voted={true} />}
    </div>}
    {started && !finished && account && vote && !changingVote && <Button basic onClick={(e) => onChangeVote && onChangeVote(e, true)}>{l('page.proposal_detail.vote_change')}</Button>}
    {started && !finished && account && vote && changingVote && <Button basic onClick={(e) => onChangeVote && onChangeVote(e, false)}>{l('general.cancel')}</Button>}
  </div>
})