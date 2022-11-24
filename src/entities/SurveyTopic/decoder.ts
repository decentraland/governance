import { Survey } from './types'
import { SURVEY_KEY } from './utils'

export class SurveyDecoder {
  public decode(encodedSurvey?: string): Survey {
    if (!encodedSurvey || encodedSurvey.length < 1) return []
    try {
      const parsedSurvey = JSON.parse(encodedSurvey)
      return parsedSurvey[SURVEY_KEY] as Survey
    } catch (e) {
      console.log(`Unable to parse encoded survey ${encodedSurvey}`)
      return []
    }
  }
}
