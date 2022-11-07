import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import Cancel from '../Icon/Cancel'
import CheckCircle from '../Icon/CheckCircle'
import Minus from '../Icon/Minus'

import './ResultStance.css'

interface Props {
  isMatch: boolean
  isProposalActive: boolean
}

enum Stance {
  MATCH,
  DIFFERS,
  PENDING,
}

const StanceConfig: Record<Stance, { icon: React.ReactNode; text: string }> = {
  [Stance.MATCH]: {
    icon: <CheckCircle size="16" />,
    text: 'page.profile.voted_proposals.stance_shared',
  },
  [Stance.DIFFERS]: {
    icon: <Cancel size="16" />,
    text: 'page.profile.voted_proposals.stance_differs',
  },
  [Stance.PENDING]: {
    icon: <Minus size="16" />,
    text: 'page.profile.voted_proposals.stance_pending',
  },
}

function ResultStance({ isMatch, isProposalActive }: Props) {
  const t = useFormatMessage()
  const stance = useMemo(() => {
    if (isProposalActive) {
      return Stance.PENDING
    }
    return isMatch ? Stance.MATCH : Stance.DIFFERS
  }, [isMatch, isProposalActive])

  const { icon, text } = StanceConfig[stance]
  return (
    <div className="ResultStance">
      {icon}
      <div className="ResultStance__Text">
        <Header sub>{t(text)}</Header>
      </div>
    </div>
  )
}

export default ResultStance
