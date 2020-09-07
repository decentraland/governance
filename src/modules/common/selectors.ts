import { createSelector } from 'reselect'
import { getNetwork, getProvider } from 'modules/wallet/selectors'
import { Contract } from 'ethers'
import { LANDRegistry, EstateRegistry, MANAMiniMeToken } from './contracts'

import RegisterABI from './Register.abi.json'
import MiniMeABI from './MiniMe.abi.json'

export const getLandContract = createSelector(
  getNetwork,
  getProvider,
  (network, provider) => new Contract(LANDRegistry[network], RegisterABI, provider?.getSigner(0))
)

export const getEstateContract = createSelector(
  getNetwork,
  getProvider,
  (network, provider) => new Contract(EstateRegistry[network], RegisterABI, provider?.getSigner(0))
)

export const getManaMiniMeContract = createSelector(
  getNetwork,
  getProvider,
  (network, provider) => new Contract(MANAMiniMeToken[network], MiniMeABI, provider?.getSigner(0))
)
