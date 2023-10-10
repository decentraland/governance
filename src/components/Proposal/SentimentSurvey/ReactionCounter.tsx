import { Reaction } from '../../../entities/SurveyTopic/types'
import { REACTION_LIST } from '../../../entities/SurveyTopic/utils'
import useFormatMessage from '../../../hooks/useFormatMessage'
import IconHelper from '../../Helper/IconHelper'

interface Props {
  reactionType: Reaction
  count: number
}

const ReactionCounter = ({ reactionType, count }: Props) => {
  const t = useFormatMessage()
  const reactionWithIcon = REACTION_LIST.find((reactionIcon) => reactionIcon.reaction === reactionType)
  if (!reactionWithIcon) {
    console.log(`Missing icon for reaction type ${reactionType}`)
    return null
  }

  return (
    <div className="ReactionCounter">
      <IconHelper
        text={t(`component.reaction_icon.${reactionWithIcon.reaction}`)}
        icon={reactionWithIcon.icon}
        position={'bottom center'}
      />
      <span className="ReactionCount"> {count}</span>
    </div>
  )
}

export default ReactionCounter
