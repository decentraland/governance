import classNames from 'classnames'

import { ChoiceColor } from '../../entities/Votes/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import ChevronRight from '../Icon/ChevronRight'
import TextWithTooltip from '../Proposal/View/TextWithTooltip'

import './ChoiceProgress.css'
import Progress from './Progress'

export type ChoiceProgressProps = {
  choice: string
  votes: number
  power: number
  progress: number
  color: ChoiceColor
  onClick?: () => void
}

export default function ChoiceProgress({ choice, progress, power, color, votes, onClick }: ChoiceProgressProps) {
  const t = useFormatMessage()
  const hasVotes = votes > 0

  return (
    <div
      className={classNames('ChoiceProgress', hasVotes && 'ChoiceProgress--clickable')}
      onClick={hasVotes ? onClick : undefined}
    >
      <div className="ChoiceProgress__Description">
        <TextWithTooltip className="ChoiceProgress__Choice">{choice}</TextWithTooltip>
        <div className="ChoiceProgress__Stats">{progress}%</div>
      </div>
      <Progress color={color} progress={progress} />
      <div className="ChoiceProgress__Votes">
        <strong>
          {t('general.number', { value: power })}
          {' VP '}
        </strong>
        <span className="ChoiceProgress__VotesCount">
          {t('general.count_votes', { count: votes })}{' '}
          {hasVotes && <ChevronRight className="ChoiceProgress__VotesCountIcon" color="var(--black-600)" />}
        </span>
      </div>
    </div>
  )
}
