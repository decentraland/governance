import { params } from './utils'

export const locations = {
  root: (options?: Record<string, any>) => '/' + params(options),
  proposal: (app: string = ':app', id: string | number = `:id`) => `/proposal/${app}/vote/${id}`,
  wrapping: () => '/wrapping/',
  debug: () => '/debug'
}
