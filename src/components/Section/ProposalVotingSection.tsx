import React, { useMemo, useState } from 'react'
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
  let [account, accountState] = useAuthContext()
  const [delegations] = useDelegation(account)
  let delegate: string | null = delegations?.delegatedTo[0]?.delegate
  let delegators: string[] = delegations?.delegatedFrom.map((delegator) => delegator.delegator)


  const testing = false // TODO: this can all be deleted after demo, or we can use a feature flag
  const [testCaseIndex, setTestCaseIndex] = useState(0)
  const testData: TestData = TEST_CASES[testCaseIndex]
  if (testing) {
    votes = testData.votes
    delegators = testData.delegators
    account = testData.account
    delegate = testData.accountDelegate
  }
  const { vote, delegateVote, delegationsLabel, votedChoice, showChoiceButtons } = useMemo(
    () => getVotingSectionConfig(votes, choices, delegate, delegators, account),
    [testData]
  )
  const { votesByChoices, totalVotes } = useMemo(() => getPartyVotes(delegators, votes, choices), [testData])

  function next() {
    if(testCaseIndex < TEST_CASES.length - 1) setTestCaseIndex(testCaseIndex + 1)
  }
  function prev() {
    if(testCaseIndex > 0) setTestCaseIndex(testCaseIndex - 1)
  }

  return (
    <div className="DetailsSection__Content OnlyDesktop">
      {testing && (
        <div className={'TestCases'}>
          <span className={'TestCase__Name'}>{testData.caseLabel}</span>
          <div className={'TestCases__Buttons'}>
            <Button basic onClick={prev}>
              Prev
            </Button>
            <Button basic onClick={next}>
              Next
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
