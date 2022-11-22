import React, { useMemo } from 'react'

import Bold from 'decentraland-gatsby/dist/components/Text/Bold'
import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import 'flickity/css/flickity.css'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { ChoiceProgressProps } from '../Status/ChoiceProgress'

import './VotingResultsInfo.css'

export type VotingResultsInfoProps = {
  proposal: ProposalAttributes
  partialResults: ChoiceProgressProps[]
}

export default function VotingResultsInfo({ proposal, partialResults }: VotingResultsInfoProps) {
  const t = useFormatMessage()
  const endDate = Time.from(proposal?.finish_at)
  const timeout = useCountdown(endDate)

  const voteCount = useMemo(
    () => partialResults.reduce((sum, choiceProgress) => sum + choiceProgress.votes, 0),
    [partialResults]
  )

  return (
    <div className="VotingResultsInfo">
      {timeout.time > 0 && (
        <div className="VotingResultsInfo__Container">
          <div className="VotingResultsInfo__Subtitle">
            {t(`page.proposal_detail.voting_section.${timeout.time > 0 ? 'voting_open' : 'voting_closed'}`)}
          </div>
          <div className="VotingResultsInfo__Title">
            <Bold>
              {timeout.time > 0
                ? t('page.proposal_detail.time_left_label', { countdown: endDate.fromNow() })
                : t('page.proposal_detail.voting_section.voting_finished', { timeElapsed: endDate.fromNow() })}
            </Bold>
          </div>
        </div>
      )}
      {timeout.time <= 0 && (
        <div className="VotingResultsInfo__Container">
          <div className="VotingResultsInfo__Title">
            <Bold>{t('page.proposal_detail.voting_section.voting_finished', { timeElapsed: endDate.fromNow() })}</Bold>
          </div>
        </div>
      )}
      <div className="VotingResultsInfo__Container">
        <div className="VotingResultsInfo__Subtitle">{t('page.proposal_detail.voting_section.vote_count_title')}</div>
        <div className="VotingResultsInfo__Title">
          <Bold>{t('page.proposal_detail.voting_section.vote_count', { voteCount: voteCount })}</Bold>
        </div>
      </div>
    </div>
  )
}
