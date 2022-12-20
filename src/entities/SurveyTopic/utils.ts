import { Reaction, Survey } from './types'

type ReactionWithIcon = { reaction: Reaction; icon: string }
export const REACTION_LIST: ReactionWithIcon[] = [
  { reaction: Reaction.LOVE, icon: '🥰' },
  { reaction: Reaction.LIKE, icon: '😊' },
  { reaction: Reaction.NEUTRAL, icon: '😐' },
  { reaction: Reaction.CONCERNED, icon: '🤨' },
  { reaction: Reaction.EMPTY, icon: '-' },
]

export class SurveyEncoder {
  static encode(survey?: Survey | null): string {
    if (!survey || survey.length < 1) survey = []
    try {
      const encodedSurvey: Record<string, unknown> = { survey }
      return JSON.stringify(encodedSurvey)
    } catch (e) {
      console.log(`Unable to encode survey: ${survey}`) //TODO: report error
      return '{"survey":[]}'
    }
  }
}
