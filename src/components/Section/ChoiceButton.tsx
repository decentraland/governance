import React from 'react'
import { Button, ButtonProps } from 'decentraland-ui/dist/components/Button/Button'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { ChoiceColor } from '../../entities/Votes/types'
import './ChoiceButton.css'

export type ChoiceButtonProps = Omit<ButtonProps, 'children' | 'color'> & {
  choice?: string,
  voted?: boolean,
  color?: ChoiceColor,
}

export default function ChoiceButton({ voted, color, choice, ...props }: ChoiceButtonProps) {
  const l = useFormatMessage()
  return <Button {...props} className={TokenList.join([
    'ChoiceButton',
    voted && `ChoiceButton--voted`,
    typeof color === 'string' && `ChoiceButton--${color}`,
    typeof color === 'number' && `ChoiceButton--status-${color % 8}`,
    props.className
  ])}>
    {voted ? l('page.proposal_detail.voted_choice', { choice }) : l('page.proposal_detail.vote_choice', { choice })}
  </Button>
}