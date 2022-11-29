import { ReactionType, Survey } from './types'

type ReactionView = { reaction: ReactionType; icon: string }
export const REACTIONS_VIEW: ReactionView[] = [
  { reaction: ReactionType.LOVE, icon: '🥰' },
  { reaction: ReactionType.LIKE, icon: '😊' },
  { reaction: ReactionType.NEUTRAL, icon: '😐' },
  { reaction: ReactionType.CONCERNED, icon: '🤨' },
  { reaction: ReactionType.EMPTY, icon: '-' },
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
