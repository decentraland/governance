import React from 'react'

import Bold from 'decentraland-gatsby/dist/components/Text/Bold'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { MINIMUM_VP_REQUIRED_TO_VOTE } from '../../../entities/Votes/constants'
import { Vote } from '../../../entities/Votes/types'

import './DelegationsLabel.css'
import './VotingSectionFooter.css'

interface VotingSectionFooterProps {
  accountVotingPower: number
  hasEnoughToVote: boolean
  vote: Vote | null
}

const VoteVotingPowerInfo = ({ accountVotingPower, hasEnoughToVote, vote }: VotingSectionFooterProps) => {
  const t = useFormatMessage()

  function vpLabel(value: number) {
    return <Bold>{t(`general.number`, { value: value })} VP</Bold>
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
