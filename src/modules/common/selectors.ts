import { createSelector } from 'reselect'
import { getData as getApps } from 'modules/app/selectors'
import { getNetwork, getProvider } from 'modules/wallet/selectors'
import { Contract } from 'ethers'
import {
  LANDRegistry,
  EstateRegistry,
  MANAMiniMeToken,
  MANAToken,
  LANDProxy,
  EstateProxy, AragonAggregator
} from './contracts'

import RegisterABI from './Register.abi.json'
import MiniMeABI from './MiniMe.abi.json'
import ERC20ABI from './ERC20.abi.json'
import { Delay } from 'modules/app/types'

export const getManaContract = createSelector(
  getNetwork,
  getProvider,
  (network, provider) => new Contract(MANAToken[network], ERC20ABI, provider?.getSigner(0))
)

export const getManaMiniMeContract = createSelector(
  getNetwork,
  getProvider,
  (network, provider) => new Contract(MANAMiniMeToken[network], MiniMeABI, provider?.getSigner(0))
)

export const getLandContract = createSelector(
  getNetwork,
  getProvider,
  (network, provider) => new Contract(LANDProxy[network] || LANDRegistry[network], RegisterABI, provider?.getSigner(0))
)

export const getEstateContract = createSelector(
  getNetwork,
  getProvider,
  (network, provider) => new Contract(EstateProxy[network] || EstateRegistry[network], RegisterABI, provider?.getSigner(0))
)

export const getAragonAggregatorContract = createSelector(
  getNetwork,
  getProvider,
  getApps,
  (network, provider, apps) => {
    const app = apps[AragonAggregator[network]]
    if (!app) {
      return undefined
    }

    return new Contract(AragonAggregator[network], app.abi, provider?.getSigner(0))
  }
)

export const getDelayContract = createSelector(
  getNetwork,
  getProvider,
  getApps,
  (network, provider, apps) => {
    const app = apps[Delay[network]]
    if (!app) {
      return undefined
    }

    return new Contract(app.address, app.abi, provider?.getSigner(0))
  }
)
