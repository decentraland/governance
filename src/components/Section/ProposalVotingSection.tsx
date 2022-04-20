import React from 'react'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import Bold from 'decentraland-gatsby/dist/components/Text/Bold'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Vote } from '../../entities/Votes/types'
import locations from '../../modules/locations'
import { calculateChoiceColor } from '../../entities/Votes/utils'
import ChoiceButton from './ChoiceButton'
import useDelegation from '../../hooks/useDelegation'
import DelegateLabel from './DelegateLabel'
import VotedChoiceButton from './VotedChoiceButton'

interface Props {
  votes?: Record<string, Vote> | null
  loading?: boolean
  changingVote?: boolean
  choices: string[]
  started: boolean
  finished: boolean
  onVote?: (e: React.MouseEvent<any, MouseEvent>, choice: string, choiceIndex: number) => void
  onChangeVote?: (e: React.MouseEvent<any, MouseEvent>, changing: boolean) => void
  votingPower?: number
}

const ProposalVotingSection = ({
  votes,
  loading,
  changingVote,
  choices,
  started,
  finished,
  onVote,
  onChangeVote,
  votingPower,
}: Props) => {
  const [account, accountState] = useAuthContext()
  const t = useFormatMessage()
  const [delegations] = useDelegation(account)
  const vote = (account && votes && votes[account]) || null
  const delegate = delegations?.delegatedTo[0]?.delegate
  const delegateVote = votes?.[delegate]
  const somebodyVoted = vote || delegateVote
  const hasChoices = choices.length > 0
  const showChoiceButtons = account && hasChoices && (!somebodyVoted || changingVote)
  const showVotingPower = started && account && (!somebodyVoted || changingVote)
  const showVote = account && hasChoices && vote && !changingVote
  const showDelegateVote = account && !vote && delegateVote && !changingVote
  const isVotingOpen = started && !finished
  const showChangeVoteButton = isVotingOpen && somebodyVoted && !changingVote
  const showCancelChangeVoteButton = isVotingOpen && somebodyVoted && changingVote

  return (
    <div className="DetailsSection__Content OnlyDesktop">
      <Loader active={!loading && accountState.loading} />

      {!account && (
        <Button
          basic
          loading={accountState.loading}
          disabled={accountState.loading}
          onClick={() => accountState.select()}
        >
          {t('general.sign_in')}
        </Button>
      )}

      {delegate && <DelegateLabel vote={vote} delegateVote={delegateVote} delegate={delegate} />}

      {showChoiceButtons &&
        choices.map((currentChoice, currentChoiceIndex) => {
          return (
            <ChoiceButton
              key={currentChoice}
              voted={vote?.choice === currentChoiceIndex + 1 || delegateVote?.choice === currentChoiceIndex + 1}
              disabled={
                vote?.choice === currentChoiceIndex + 1 || delegateVote?.choice === currentChoiceIndex + 1 || !started
              }
              color={calculateChoiceColor(currentChoice, currentChoiceIndex)}
              onClick={(e: React.MouseEvent<any>) => onVote && onVote(e, currentChoice, currentChoiceIndex + 1)}
              text={t('page.proposal_detail.vote_choice', { choice: currentChoice })}
            />
          )
        })}
      {showVotingPower && (
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {t('page.proposal_detail.voting_with', {
              vp: <Bold>{t(`general.number`, { value: votingPower || 0 })} VP</Bold>,
            })}
          </div>
          <div>
            <Link href={locations.balance()}>{t('page.proposal_detail.vote_manage')}</Link>
          </div>
        </div>
      )}

      {(showVote || showDelegateVote) && (
        <VotedChoiceButton vote={vote} delegateVote={delegateVote} choices={choices} />
      )}

      {showChangeVoteButton && (
        <Button basic onClick={(e) => onChangeVote && onChangeVote(e, true)}>
          {vote ? t('page.proposal_detail.vote_change') : t('page.proposal_detail.vote_overrule')}
        </Button>
      )}

      {showCancelChangeVoteButton && (
        <Button basic onClick={(e) => onChangeVote && onChangeVote(e, false)}>
          {t('general.cancel')}
        </Button>
      )}
    </div>
  )
}

export default ProposalVotingSection
