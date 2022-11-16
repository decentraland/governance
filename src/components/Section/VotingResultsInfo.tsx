import React, { useRef } from 'react'
import Flickity from 'react-flickity-component'

import Bold from 'decentraland-gatsby/dist/components/Text/Bold'
import useCountdown from 'decentraland-gatsby/dist/hooks/useCountdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import 'flickity/css/flickity.css'

import { ProposalAttributes } from '../../entities/Proposal/types'
import useAbbreviatedFormatter from '../../hooks/useAbbreviatedFormatter'
import { ChoiceProgressProps } from '../Status/ChoiceProgress'

import './VotingResultsInfo.css'

export type VotingResultsInfoProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal: ProposalAttributes
  partialResults: ChoiceProgressProps[]
}

export default function VotingResultsInfo({ proposal, partialResults }: VotingResultsInfoProps) {
  const t = useFormatMessage()
  const endDate = Time.from(proposal?.finish_at)
  const timeout = useCountdown(endDate)

  return (
    <div className="VotingResultsInfo">
      {timeout.time > 0 && (
        <div className="VotingResultsInfo__Container">
          <div className="VotingResultsInfo__Subtitle">{timeout.time > 0 ? 'Open for votes' : 'Voting closed'}</div>
          <div className="VotingResultsInfo__Title">
            <Bold>
              {timeout.time > 0
                ? t('page.proposal_detail.time_left_label', { countdown: endDate.fromNow() })
                : 'Voting finished '.concat(endDate.fromNow())}
            </Bold>
          </div>
        </div>
      )}
      {timeout.time <= 0 && (
        <div className="VotingResultsInfo__Container">
          <div className="VotingResultsInfo__Subtitle">{}</div>
          <div className="VotingResultsInfo__Title">
            <Bold>{'Voting finished '.concat(endDate.fromNow())}</Bold>
          </div>
        </div>
      )}
      <div className="VotingResultsInfo__Container">
        <div className="VotingResultsInfo__Subtitle">{'Voting activity'}</div>
        <div className="VotingResultsInfo__Title">
          <Bold>{partialResults.reduce((sum, choiceProgress) => sum + choiceProgress.votes, 0) + ' total votes'}</Bold>
        </div>
      </div>
    </div>
  )
}
