import { createSelector } from 'reselect'
import { getNetwork, getProvider } from 'modules/wallet/selectors'
import { Contract } from 'ethers'
import { LANDRegistry, EstateRegistry, MANAMiniMeToken, MANAToken, LANDProxy, EstateProxy } from './contracts'

import RegisterABI from './Register.abi.json'
import MiniMeABI from './MiniMe.abi.json'
import ERC20ABI from './ERC20.abi.json'

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
