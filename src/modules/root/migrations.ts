import { createDescription } from 'modules/description/utils'
import { RootState } from './types'

export const migrations = {
  '2': (state: RootState): RootState => {
    const descriptions = Object.entries(state?.description?.data || {})
      .map(([id, description]) => [id, createDescription(description.describedSteps)])

    return {
      ...state || {},
      description: {
        ...state.description || {},
        data: Object.fromEntries(descriptions)
      }
    }
  }
}
