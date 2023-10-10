import { useMemo } from 'react'

import useFormatMessage from '../../hooks/useFormatMessage'
import Cancel from '../Icon/Cancel'
import CheckCircle from '../Icon/CheckCircle'
import Pending from '../Icon/Pending'

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
    icon: <Pending size="16" />,
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
      <span className="ResultStance__Text">{t(text)}</span>
    </div>
  )
}

export default ResultStance
