import { params } from './utils'
import { NewProposalParams, UnwrapParams, CastParams, FilterProposalParams } from './types'

export const locations = {
  root: (options?: NewProposalParams | FilterProposalParams) => '/' + params(options),
  proposal: (app: string = ':app', id: string | number = `:id`, options?: CastParams) => `/proposal/${app}/vote/${id}` + params(options),
  wrapping: (options?: UnwrapParams) => '/wrapping/' + params(options),
  debug: () => '/debug'
}
