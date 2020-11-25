import { connect } from 'react-redux'

import { RootState } from 'modules/root/types'
import { getData as getCasts, getPendingCasts } from 'modules/cast/selectors'
import { getData as getBalance } from 'modules/balance/selectors'
import ProposalTitle from './ProposalAction'
import { MapDispatchProps, MapStateProps, MapDispatch, DefaultProps } from './ProposalAction.types'
import { isExecuting } from 'modules/proposal/selectors'
import { getAddress, isConnecting, isEnabling } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { Cast } from '@aragon/connect-voting'

const mapState = (state: RootState, props: DefaultProps): MapStateProps => {
  const vote = props.vote
  const casts = getCasts(state)[vote.id]
  const balance = getBalance(state)[vote.id]
  const address = (getAddress(state) || '').toLowerCase()
  let cast: Cast | undefined = undefined

  if (Boolean(address) && Array.isArray(casts)) {
    for (const currentCast of casts) {
      if (currentCast.voter.address.toLowerCase() === address) {
        if (!cast || cast.vote < currentCast.vote) {
          cast = currentCast
        }
      }
    }
  }

  return {
    balance,
    cast,
    casts,
    isLoading: (
      isConnecting(state) ||
      isEnabling(state) ||
      isExecuting(state) ||
      getPendingCasts(state).includes(vote.id)
    )
  }
}

const mapDispatch = (_dispatch: MapDispatch): MapDispatchProps => ({})

export default connect(mapState, mapDispatch)(ProposalTitle)
