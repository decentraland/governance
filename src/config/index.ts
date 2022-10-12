import { Env, createConfig } from '@dcl/ui-env'

import dev from './env/dev.json'
import local from './env/local.json'
import prod from './env/prd.json'

export const config = createConfig({
  [Env.LOCAL]: local,
  [Env.DEVELOPMENT]: dev,
  [Env.PRODUCTION]: prod,
})
