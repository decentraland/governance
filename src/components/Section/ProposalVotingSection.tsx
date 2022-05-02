import React, { useState } from 'react'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Vote } from '../../entities/Votes/types'
import { getPartyVotes, getVotingSectionConfig } from '../../entities/Votes/utils'
import useDelegation from '../../hooks/useDelegation'
import { ChoiceButtons } from './ChoiceButtons'
import DelegationsLabel from './DelegationsLabel'
import { TEST_CASES, TestData } from './ProposalResultSectionTestCases'
import VotedChoiceButton from './VotedChoiceButton'
import VotingSectionFooter from './VotingSectionFooter'
import './TestCases.css'

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
  const [account, accountState] = useAuthContext()
  const [delegations] = useDelegation(account)

  const testing = true // TODO: this can all be deleted after demo, or we can use a feature flag
  const [testCaseIndex, setTestCaseIndex] = useState(0)
  const testData: TestData = TEST_CASES[testCaseIndex]
  let delegate = delegations?.delegatedTo[0]?.delegate
  let delegators: string[] = delegations?.delegatedFrom.map((delegator) => delegator.delegator)

  if (testing) {
    votes = testData.votes
    delegators = testData.delegators
    delegate = testData.accountDelegate
  }

  const { vote, delegateVote, delegationsLabel, votedChoice, showChoiceButtons } = getVotingSectionConfig(
    votes,
    choices,
    delegate,
    delegators,
    account
  )
  const { votesByChoices, totalVotes } = getPartyVotes(delegators, votes, choices)

  return (
    <div className="DetailsSection__Content OnlyDesktop">
      {testing && (
        <div className={'TestCases'}>
          <span className={'TestCase__Name'}>{testData.caseLabel}</span>
          <div className={'TestCases__Buttons'}>
            <Button basic onClick={() => setTestCaseIndex(testCaseIndex + 1)}>
              Next
            </Button>
            <Button basic onClick={() => setTestCaseIndex(testCaseIndex - 1)}>
              Prev
            </Button>
          </div>
        </div>
      )}
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
