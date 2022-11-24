import { Survey } from './types'

export class SurveyDecoder {
  public decode(encodedSurvey?: string): Survey {
    if (!encodedSurvey || encodedSurvey.length < 1) return []
    try {
      return JSON.parse(encodedSurvey)
    } catch (e) {
      console.log(`Unable to parse encoded survey ${encodedSurvey}`)
      return []
    }
  }
}
