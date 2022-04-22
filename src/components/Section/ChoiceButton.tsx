import React from 'react'
import { Button, ButtonProps } from 'decentraland-ui/dist/components/Button/Button'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { ChoiceColor } from '../../entities/Votes/types'
import './ChoiceButton.css'

export type ChoiceButtonProps = Omit<ButtonProps, 'color'> & {
  voted?: boolean
  color?: ChoiceColor
  voteCount?: number
  partyTotalVotes?: number
}

export default function ChoiceButton({ voted, color, voteCount, partyTotalVotes, children, ...props }: ChoiceButtonProps) {
  const percentage = voteCount && partyTotalVotes ? Math.round((voteCount / partyTotalVotes) * 100) + '%' : null
  return (
    <Button
      {...props}
      className={TokenList.join([
        'ChoiceButton',
        voted && `ChoiceButton--voted`,
        typeof color === 'string' && `ChoiceButton--${color}`,
        typeof color === 'number' && `ChoiceButton--status-${color % 8}`,
        props.className,
      ])}
    >
      {percentage && <div className={'ChoiceButton__Background'} style={{ width: percentage }} />}
      <span className={'ChoiceButton__Text'}>
        {children}
      </span>
      {!!partyTotalVotes && (partyTotalVotes > 0) && <span className={'ChoiceButton__VoteCount'}>({voteCount})</span>}
    </Button>
  )
}
