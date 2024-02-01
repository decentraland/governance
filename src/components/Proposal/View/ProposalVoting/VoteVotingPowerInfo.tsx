import { MINIMUM_VP_REQUIRED_TO_VOTE } from '../../../../entities/Votes/constants'
import { Vote } from '../../../../entities/Votes/types'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import Text from '../../../Common/Typography/Text'

interface VoteVotingPowerInfoProps {
  accountVotingPower: number
  hasEnoughToVote: boolean
  vote: Vote | null
}

const VoteVotingPowerInfo = ({ accountVotingPower, hasEnoughToVote, vote }: VoteVotingPowerInfoProps) => {
  const t = useFormatMessage()

  function vpLabel(value: number) {
    return (
      <Text as="span" weight="bold" size="sm">
        {t(`general.number`, { value: value })} VP
      </Text>
    )
  }

  return (
    <>
      {hasEnoughToVote &&
        (vote
          ? t('page.proposal_detail.voted_with', { vp: vpLabel(accountVotingPower) })
          : t('page.proposal_detail.voting_with', { vp: vpLabel(accountVotingPower) }))}
      {!hasEnoughToVote && t('page.proposal_detail.vp_needed', { vp: vpLabel(MINIMUM_VP_REQUIRED_TO_VOTE) })}
    </>
  )
}

export default VoteVotingPowerInfo
