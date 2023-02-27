import { Env } from '@dcl/ui-env'

import { config } from '../config'

export const env = (variable: string, defaultValue?: string) => {
  return config.get(variable, defaultValue)
}

export const isDevEnv = () => {
  return config.getEnv() === Env.LOCAL || config.getEnv() === Env.DEVELOPMENT || process.env.HEROKU === 'true'
}
