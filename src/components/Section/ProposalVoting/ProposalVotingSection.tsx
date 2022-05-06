import React, { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { Vote } from '../../../entities/Votes/types'
import useDelegation from '../../../hooks/useDelegation'
import useVotingSectionTestData, { TestData } from '../../../hooks/useVotingSectionTestData'
import { getPartyVotes, getVotingSectionConfig } from '../../../modules/votes/utils'
import VotingSectionTester from '../VotingSectionTester'

import { ChoiceButtons } from './ChoiceButtons'
import DelegationsLabel from './DelegationsLabel'
import VotedChoiceButton from './VotedChoiceButton'
import VotingSectionFooter from './VotingSectionFooter'

interface Props {
  votes?: Record<string, Vote> | null
  loading?: boolean
  changingVote?: boolean
  choices: string[]
  started: boolean
  finished: boolean
  onVote?: (e: React.MouseEvent<any, MouseEvent>, choice: string, choiceIndex: number) => void
  onChangeVote?: (e: React.MouseEvent<any, MouseEvent>, changing: boolean) => void
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
}: Props) => {
  const t = useFormatMessage()
  let [account, accountState] = useAuthContext()
  const [delegations] = useDelegation(account)
  let delegate: string | null = delegations?.delegatedTo[0]?.delegate
  let delegators: string[] = delegations?.delegatedFrom.map((delegator) => delegator.delegator)

  const testData: TestData | null = useVotingSectionTestData()
  if (testData) {
    account = testData.account
    delegate = testData.accountDelegate
    delegators = testData.delegators
    votes = testData.votes
    choices = testData.choices
  }

  const { vote, delegateVote, delegationsLabel, votedChoice, showChoiceButtons } = useMemo(
    () => getVotingSectionConfig(votes, choices, delegate, delegators, account),
    [testData]
  )
  const { votesByChoices, totalVotes } = useMemo(() => getPartyVotes(delegators, votes, choices), [testData])

  return (
    <div className="DetailsSection__Content OnlyDesktop">
      {testData && <VotingSectionTester testData={testData} />}
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

      {delegationsLabel && <DelegationsLabel {...delegationsLabel} />}

      {(showChoiceButtons || changingVote) && (
        <ChoiceButtons
          choices={choices}
          vote={vote}
          votesByChoices={votesByChoices}
          delegate={delegate}
          delegateVote={delegateVote}
          totalVotes={totalVotes}
          onVote={onVote}
          started={started}
        />
      )}

      {votedChoice && !changingVote && <VotedChoiceButton {...votedChoice} />}

      <VotingSectionFooter
        vote={vote}
        delegateVote={delegateVote}
        hasDelegators={delegators && delegators.length > 0}
        started={started}
        finished={finished}
        account={account}
        changingVote={changingVote}
        onChangeVote={onChangeVote}
      />
    </div>
  )
}

export default ProposalVotingSection
