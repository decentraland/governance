import { params } from './utils'
import { NewProposalParams, UnwrapParams } from './types'

export const locations = {
  root: (options?: NewProposalParams) => '/' + params(options),
  proposal: (app: string = ':app', id: string | number = `:id`) => `/proposal/${app}/vote/${id}`,
  wrapping: (options?: UnwrapParams) => '/wrapping/' + params(options),
  debug: () => '/debug'
}
