import React, { useCallback} from 'react'
import { Button, ButtonProps } from 'decentraland-ui/dist/components/Button/Button'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { ChoiceColor } from '../../entities/Votes/types'
import './ChoiceButton.css'
import { ProposalType } from '../../entities/Proposal/types'

export type ChoiceButtonProps = Omit<ButtonProps, 'children' | 'color'> & {
  choice?: string,
  voted?: boolean,
  color?: ChoiceColor,
  proposalType?: ProposalType,
}

export default function ChoiceButton({ voted, color, choice, proposalType, ...props }: ChoiceButtonProps) {
  const l = useFormatMessage()

  const getText = useCallback(() => {
    if (proposalType === ProposalType.Feature) {
      return choice
    }

    return voted ? l('page.proposal_detail.voted_choice', { choice }) : l('page.proposal_detail.vote_choice', { choice })
  }, [proposalType, voted, choice])

  return <Button {...props} className={TokenList.join([
    'ChoiceButton',
    voted && `ChoiceButton--voted`,
    typeof color === 'string' && `ChoiceButton--${color}`,
    typeof color === 'number' && `ChoiceButton--status-${color % 8}`,
    props.className
  ])}>
    {getText()}
  </Button>
}