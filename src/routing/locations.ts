import { params } from './utils'
import { NewProposalParams, UnwrapParams, CastParams, FilterProposalParams, SignInParams } from './types'

export const locations = {
  proposals: (options?: NewProposalParams | FilterProposalParams | SignInParams) => '/' + params(options),
  vote: (app: string = ':app', id: string | number = `:id`, options?: CastParams | SignInParams) => `/proposal/${app}/vote/${id}` + params(options),
  delay: (app: string = ':app', id: string | number = `:id`, options?: CastParams | SignInParams) => `/proposal/${app}/delay/${id}` + params(options),
  wrapping: (options?: UnwrapParams | SignInParams) => '/wrapping/' + params(options),
  signIn: () => '/sign-in',
  debug: () => '/debug'
}
