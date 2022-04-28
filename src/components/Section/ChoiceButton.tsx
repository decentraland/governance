import React from 'react'
import { Button, ButtonProps } from 'decentraland-ui/dist/components/Button/Button'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { ChoiceColor } from '../../entities/Votes/types'
import './ChoiceButton.css'
import Username from '../User/Username'

export type ChoiceButtonProps = Omit<ButtonProps, 'color'> & {
  voted?: boolean
  color?: ChoiceColor
  delegate?: string
  voteCount?: number
  totalVotes?: number
}

export default function ChoiceButton({ voted, color, delegate, voteCount, totalVotes, children, ...props }: ChoiceButtonProps) {
  const percentage = voteCount && totalVotes ? Math.round((voteCount / totalVotes) * 100) + '%' : null
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
      {!!delegate && <span className={'ChoiceButton__Delegate'}><Username address={delegate} hideAddress /></span>}
      <span className={'ChoiceButton__Text'}>
        {children}
      </span>
      {!!totalVotes && (totalVotes > 0) && <span className={'ChoiceButton__VoteCount'}>({voteCount})</span>}
    </Button>
  )
}
