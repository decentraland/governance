import { config } from '../config'

export const env = (variable: string, defaultValue?: string) => {
  return config.get(variable, defaultValue)
}
