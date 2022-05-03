import Bold from 'decentraland-gatsby/dist/components/Text/Bold'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import React from 'react'
import { Vote } from '../../entities/Votes/types'
import useVotingPowerBalance from '../../hooks/useVotingPowerBalance'
import './DelegationsLabel.css'
import './VotingSectionFooter.css'

interface VotingSectionFooterProps {
  vote: Vote | null
  account: string | null
}

const VoteVotingPowerInfo = ({ vote, account }: VotingSectionFooterProps) => {
  const { votingPower, isLoadingVotingPower } = useVotingPowerBalance(account)
  const hasEnoughVP = !!votingPower && votingPower > 0 && !isLoadingVotingPower

  const t = useFormatMessage()

  function vpLabel(value: number) {
    return <Bold>{t(`general.number`, { value: value })} VP</Bold>
  }

  return (
    <>
      {hasEnoughVP &&
        (vote
          ? t('page.proposal_detail.voted_with', { vp: vpLabel(votingPower) })
          : t('page.proposal_detail.voting_with', { vp: vpLabel(votingPower) }))}
      {!hasEnoughVP && t('page.proposal_detail.vp_needed', { vp: vpLabel(0) })}
    </>
  )
}

export default VoteVotingPowerInfo
