import React, { useCallback, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import AddReaction from '../Icon/AddReaction'
import AngryEmoji from '../Icon/AngryEmoji'
import GreyX from '../Icon/GreyX'
import PartyEmoji from '../Icon/PartyEmoji'
import PokerFaceEmoji from '../Icon/PokerFaceEmoji'

import { Topic } from './SentimentSurvey'
import './SentimentSurveyRow.css'

interface Props {
  topic: Topic
  onReactionPicked: (topic: Topic, reaction: Reaction) => void
  onReactionUnpicked: (topic: Topic) => void
}

export enum ReactionType {
  HAPPY,
  INDIFFERENT,
  ANGRY,
}

export type Reaction = {
  type: ReactionType
  icon: JSX.Element
  label: string
}

const reactions: Reaction[] = [
  { type: ReactionType.HAPPY, icon: <PartyEmoji />, label: 'happy' },
  { type: ReactionType.INDIFFERENT, icon: <PokerFaceEmoji />, label: 'indifferent' },
  { type: ReactionType.ANGRY, icon: <AngryEmoji />, label: 'angry' },
]

const SentimentSurveyRow = ({ topic, onReactionPicked, onReactionUnpicked }: Props) => {
  const t = useFormatMessage()
  const [showAddReaction, setShowAddReaction] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [pickedReaction, setPickedReaction] = useState<Reaction | null>()
  const reactionPicked = pickedReaction != null

  const pickReaction = useCallback((reaction: Reaction) => {
    setShowReactions(false)
    setPickedReaction(reaction)
    onReactionPicked(topic, reaction)
  }, [])

  const changeReaction = useCallback(() => {
    setPickedReaction(null)
    onReactionUnpicked(topic)
    setShowReactions(true)
    setShowAddReaction(true)
  }, [])

  return (
    <div
      className={TokenList.join(['SentimentSurveyRow', showAddReaction && 'SentimentSurveyRow__Expanded'])}
      onMouseEnter={() => !reactionPicked && setShowAddReaction(true)}
      onMouseLeave={() => setShowAddReaction(false)}
    >
      {t(`survey.survey_topics.${topic.label}`)}

      {!showReactions && !reactionPicked && (
        <div id="slide" className="SentimentSurveyRow__AddReaction" onClick={() => setShowReactions(true)}>
          <AddReaction />
          <span className={TokenList.join([showAddReaction && 'SentimentSurveyRow__AddReactionLabel'])}>
            {t(`survey.reactions.add_reaction`)}
          </span>
        </div>
      )}

      {showReactions && (
        <div className="SentimentSurveyRow__Reactions">
          {reactions.map((reaction, index) => {
            return (
              <div key={`Reaction__${index}`} onClick={() => pickReaction(reaction)}>
                {reaction.icon}
              </div>
            )
          })}
          <div onClick={() => setShowReactions(false)}>
            <GreyX />
          </div>
        </div>
      )}

      {reactionPicked && (
        <div className="SentimentSurveyRow__Reactions SentimentSurveyRow__PickedReaction">
          {reactions.map((reaction, index) => {
            return (
              pickedReaction.type === reaction.type && (
                <div key={`Reaction__${index}`} onClick={() => changeReaction()}>
                  {reaction.icon}
                </div>
              )
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SentimentSurveyRow
