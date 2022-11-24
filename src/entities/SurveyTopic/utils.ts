import { ReactionType, Survey } from './types'

type ReactionView = { reaction: ReactionType; icon: string }
export const REACTIONS_VIEW: ReactionView[] = [
  { reaction: ReactionType.LOVE, icon: '🥰' },
  { reaction: ReactionType.LIKE, icon: '😊' },
  { reaction: ReactionType.NEUTRAL, icon: '😐' },
  { reaction: ReactionType.CONCERNED, icon: '🤨' },
  { reaction: ReactionType.EMPTY, icon: '-' },
]

export const SURVEY_KEY = 'survey'

export class SurveyEncoder {
  static encode(survey?: Survey | null): string {
    if (!survey || survey.length < 1) return '{}'

    try {
      return `{"${SURVEY_KEY}": ${JSON.stringify(survey)}}`
    } catch (e) {
      console.log(`Unable to encode survey Survey: ${survey}`)
      return '{}'
    }
  }
}
