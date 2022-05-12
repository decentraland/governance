import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import { Stats } from 'decentraland-ui/dist/components/Stats/Stats'

import { MatchResult } from '../../../entities/Snapshot/utils'
import Info from '../../Icon/Info'

import './CandidateMatch.css'

interface Props {
  matchingVotes: MatchResult
}

function matchColor(matchingVotes: MatchResult) {
  return { color: `rgb(0, ${Math.round((200 * matchingVotes.percentage) / 100)}, 0)` }
}

function CandidateMatch({ matchingVotes }: Props) {
  const t = useFormatMessage()

  return (
    matchingVotes && (
      <Stats title={t('modal.vp_delegation.details.stats_match')}>
        <Popup
          content={<span>{t('modal.vp_delegation.details.stats_match_helper')}</span>}
          position="right center"
          trigger={
            <div className="CandidateMatch__Info">
              <Info size="14" />
            </div>
          }
          on="hover"
        />
        <div className="CandidateMatch__StatsValue" style={matchColor(matchingVotes)}>
          {matchingVotes.percentage}%
        </div>
      </Stats>
    )
  )
}

export default CandidateMatch
