import { config } from '../config'

export const clientEnv = (variable: string, defaultValue?: string) => {
  return config.get(variable, defaultValue)
}
