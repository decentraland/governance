import React from 'react'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import Bold from 'decentraland-gatsby/dist/components/Text/Bold'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { Vote } from '../../entities/Votes/types'
import locations from '../../modules/locations'
import { calculateChoiceColor } from '../../entities/Votes/utils'
import ChoiceButton from './ChoiceButton'

interface Props {
  vote: Vote | null
  loading?: boolean
  account: string | null
  accountStateLoading: boolean
  accountStateSelect: (selecting?: boolean) => void
  changingVote?: boolean
  choices: string[]
  started: boolean
  onVote?: (e: React.MouseEvent<any, MouseEvent>, choice: string, choiceIndex: number) => void
  votingPower?: number
}

const ProposalVotingSection = ({
  vote,
  loading,
  account,
  accountStateLoading,
  accountStateSelect,
  changingVote,
  choices,
  started,
  onVote,
  votingPower,
}: Props) => {
  const t = useFormatMessage()

  return (
    <div className="DetailsSection__Content OnlyDesktop">
      <Loader active={!loading && accountStateLoading} />

      {!account && (
        <Button basic loading={accountStateLoading} disabled={accountStateLoading} onClick={() => accountStateSelect()}>
          {t('general.sign_in')}
        </Button>
      )}

      {account &&
        (!vote || changingVote) &&
        choices.map((currentChoice, currentChoiceIndex) => {
          return (
            <ChoiceButton
              key={currentChoice}
              choice={currentChoice}
              voted={vote?.choice === currentChoiceIndex + 1}
              disabled={vote?.choice === currentChoiceIndex + 1 || !started}
              color={calculateChoiceColor(currentChoice, currentChoiceIndex)}
              onClick={(e: React.MouseEvent<any>) => onVote && onVote(e, currentChoice, currentChoiceIndex + 1)}
            />
          )
        })}
      {started && account && (!vote || changingVote) && (
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

      {account && vote && !changingVote && (
        <ChoiceButton
          disabled={!started}
          choice={choices[vote.choice - 1]}
          color={calculateChoiceColor(choices[vote.choice - 1], vote.choice - 1)}
          voted={true}
        />
      )}
    </div>
  )
}

export default ProposalVotingSection
