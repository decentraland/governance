import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import Cancel from '../Icon/Cancel'
import CheckCircle from '../Icon/CheckCircle'

import './ResultStance.css'

interface Props {
  isMatch: boolean
}

function ResultStance({ isMatch }: Props) {
  const t = useFormatMessage()
  const text = t(`page.profile.voted_proposals.${isMatch ? 'stance_shared' : 'stance_differs'}`)
  const icon = useMemo(() => (isMatch ? <CheckCircle size="16" /> : <Cancel size="16" />), [isMatch])
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
