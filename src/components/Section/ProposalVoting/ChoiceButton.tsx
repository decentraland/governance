import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button, ButtonProps } from 'decentraland-ui/dist/components/Button/Button'

import { ChoiceColor } from '../../../entities/Votes/types'
import Username from '../../User/Username'
import TextWithTooltip from '../TextWithTooltip'

import './ChoiceButton.css'

export type ChoiceButtonProps = Omit<ButtonProps, 'color'> & {
  voted?: boolean
  color?: ChoiceColor
  delegate?: string
  voteCount?: number
  totalVotes?: number
  selected?: boolean
}

export default function ChoiceButton({
  voted,
  color,
  delegate,
  voteCount,
  totalVotes,
  selected,
  children,
  ...props
}: ChoiceButtonProps) {
  const percentage = voteCount && totalVotes ? Math.round((voteCount / totalVotes) * 100) + '%' : null
  return (
    <Button
      {...props}
      className={TokenList.join([
        'ChoiceButton',
        selected && 'ChoiceButton--selected',
        voted && `ChoiceButton--voted`,
        typeof color === 'string' && `ChoiceButton--${color}`,
        typeof color === 'number' && `ChoiceButton--status-${color % 8}`,
        props.className,
      ])}
    >
      {percentage && (
        <div
          className={TokenList.join([
            'ChoiceButton__Background',
            percentage === '100%' && 'ChoiceButton__BackgroundFull',
          ])}
          style={{ width: percentage }}
        />
      )}
      {!!delegate && (
        <span className={'ChoiceButton__Delegate'}>
          <Username address={delegate} variant="avatar" />
        </span>
      )}
      <TextWithTooltip className={'ChoiceButton__Text'}>{children}</TextWithTooltip>
      {!!totalVotes && totalVotes > 0 && <span className={'ChoiceButton__VoteCount'}>({voteCount})</span>}
    </Button>
  )
}
