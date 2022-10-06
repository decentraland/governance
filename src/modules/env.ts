import { config } from '../config'

export const env = (variable: string, defaultValue?: string) => {
  if (process.env.HEROKU === 'true') {
    return process.env[variable]
  }

  return config.get(variable, defaultValue)
}
