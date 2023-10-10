import { useCallback, useEffect, useState } from 'react'

import { Reaction, Topic } from '../../../entities/SurveyTopic/types'
import { REACTION_LIST } from '../../../entities/SurveyTopic/utils'
import useFormatMessage from '../../../hooks/useFormatMessage'
import IconHelper from '../../Helper/IconHelper'
import AddReaction from '../../Icon/AddReaction'
import Cross from '../../Icon/Cross'

import './SentimentSurveyRow.css'

interface Props {
  topic: Topic
  reaction?: Reaction | null
  onReactionPicked: (topic: Topic, reaction: Reaction) => void
  onReactionUnpicked: (topic: Topic) => void
}

const SentimentSurveyRow = ({ topic, reaction, onReactionPicked, onReactionUnpicked }: Props) => {
  const t = useFormatMessage()
  const [showReactions, setShowReactions] = useState(false)
  const [pickedReaction, setPickedReaction] = useState<Reaction | null>()
  const hasPickedReaction = !!pickedReaction

  const pickReaction = useCallback(
    (reaction: Reaction) => {
      setShowReactions(false)
      setPickedReaction(reaction)
      onReactionPicked(topic, reaction)
    },
    [onReactionPicked, topic]
  )

  const changeReaction = useCallback(() => {
    setPickedReaction(null)
    onReactionUnpicked(topic)
    setShowReactions(true)
  }, [onReactionUnpicked, topic])

  useEffect(() => {
    if (reaction && reaction !== Reaction.EMPTY) {
      setShowReactions(false)
      setPickedReaction(reaction)
    }
  }, [reaction])

  return (
    <div
      className="SentimentSurveyRow"
      onClick={() => {
        if (!showReactions && !hasPickedReaction) setShowReactions(true)
      }}
    >
      {t(`survey.survey_topics.${topic.topic_id}`)}

      {!showReactions && !hasPickedReaction && (
        <div className="SentimentSurveyRow__AddReaction">
          <AddReaction />
          <span className="SentimentSurveyRow__AddReactionLabel">{t(`survey.reactions.add_reaction`)}</span>
        </div>
      )}

      {showReactions && (
        <div className="SentimentSurveyRow__Reactions">
          {REACTION_LIST.map((reactionWithIcon, index) => {
            if (reactionWithIcon.reaction !== Reaction.EMPTY) {
              return (
                <div key={`Reaction__${index}`} onClick={() => pickReaction(reactionWithIcon.reaction)}>
                  <IconHelper
                    text={t(`component.reaction_icon.${reactionWithIcon.reaction}`)}
                    icon={reactionWithIcon.icon}
                    position={'bottom center'}
                  />
                </div>
              )
            }
          })}
          <div className="SentimentSurveyRow__Cross" onClick={() => setShowReactions(false)}>
            <Cross />
          </div>
        </div>
      )}

      {hasPickedReaction && (
        <div className="SentimentSurveyRow__Reactions SentimentSurveyRow__PickedReaction">
          {REACTION_LIST.map((reactionWithIcon, index) => {
            if (reactionWithIcon.reaction !== Reaction.EMPTY) {
              return (
                pickedReaction === reactionWithIcon.reaction && (
                  <div key={`Reaction__${index}`} onClick={changeReaction}>
                    {reactionWithIcon.icon}
                  </div>
                )
              )
            }
          })}
        </div>
      )}
    </div>
  )
}

export default SentimentSurveyRow
