import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import Cancel from '../Icon/Cancel'
import CheckCircle from '../Icon/CheckCircle'

import './ResultStance.css'

interface Props {
  resultMatches: boolean
}

function ResultStance({ resultMatches }: Props) {
  const t = useFormatMessage()
  const text = t(`page.profile.voted_proposals.${resultMatches ? 'stance_shared' : 'stance_differs'}`)
  const icon = useMemo(() => (resultMatches ? <CheckCircle size="16" /> : <Cancel size="16" />), [resultMatches])
  return (
    <div className="ResultStance">
      {icon}
      <div className="ResultStance__Text">
        <Header sub>{text}</Header>
      </div>
    </div>
  )
}

export default ResultStance
