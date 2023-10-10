import useFormatMessage from '../../../../hooks/useFormatMessage'

import ChoiceButton from './ChoiceButton'

export interface VotedChoice {
  id?: string
  values?: any
  delegate?: string
  voteCount?: number
  totalVotes?: number
}

const VotedChoiceButton = ({ id, values, delegate, totalVotes, voteCount }: VotedChoice) => {
  const t = useFormatMessage()
  const text = t(id, values)
  return (
    <ChoiceButton voted voteCount={voteCount} totalVotes={totalVotes} delegate={delegate}>
      {text}
    </ChoiceButton>
  )
}

export default VotedChoiceButton
