// `Env` is defined locally rather than imported from `@dcl/ui-env` on purpose:
// ui-env is a front-end (bundler-targeted) package and the backend should not
// depend on it at runtime. The values must match ui-env's `Env` enum.
enum Env {
  DEVELOPMENT = 'dev',
  STAGING = 'stg',
  PRODUCTION = 'prod',
}

// TODO: Review this. It is only used by getBooleanStringVar

function isEnv(value: Env | string) {
  switch (value) {
    case Env.DEVELOPMENT:
    case Env.STAGING:
    case Env.PRODUCTION:
      return true
    default:
      return false
  }
}

type EnvRecord = Record<string, string | undefined>

const ENVS: Map<Env, EnvRecord> = new Map()

function createEnvs(data: EnvRecord = {}) {
  const result: EnvRecord = {}

  if (typeof process !== 'undefined' && process.env) {
    Object.assign(result, process.env)
  }

  Object.assign(result, data)

  return result
}

function getEnv(): Env {
  if (isEnv(process.env.DCL_DEFAULT_ENV || '')) {
    return process.env.DCL_DEFAULT_ENV as Env
  }

  if (isEnv(process.env.GATSBY_DCL_DEFAULT_ENV || '')) {
    return process.env.GATSBY_DCL_DEFAULT_ENV as Env
  }

  if (process.env.NODE_ENV === 'production') {
    return Env.PRODUCTION
  }

  return Env.PRODUCTION
}

function getEnvs() {
  const env = getEnv()
  if (!ENVS.has(env)) {
    ENVS.set(env, createEnvs())
  }

  return ENVS.get(env)!
}

function env(name: string): string | undefined
function env(name: string, defaultValue: string): string
function env(name: string, defaultValue?: string): string | undefined {
  const envs = getEnvs()
  return envs[name] || envs['GATSBY_' + name] || envs['REACT_APP_' + name] || envs['STORYBOOK_' + name] || defaultValue
}

export default env

export function requiredEnv(name: string): string {
  const value = env(name, '')

  if (!value) {
    throw new Error(`Missing "${name}" environment variable. Check your .env.example file`)
  }

  return value
}
