import { config } from '../config'

export const env = (variable: string, defaultValue?: string) => {
  if (process.env.HEROKU === 'true') {
    console.log(`Heroku Process Env - ${variable}`, process.env[variable])
    return process.env[variable]
  }

  console.log(`Config Process Env - ${variable}`, process.env[variable])
  return config.get(variable, defaultValue)
}
