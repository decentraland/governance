import { useMemo } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Address } from 'web3x/address'
import { Contract, ContractAbi, ContractAbiDefinition } from 'web3x/contract'
import { Eth } from 'web3x/eth'
import { fromWei, unitMap } from 'web3x/utils/units'

import { ERC20ABI, ESTATE, LAND, MANA, MiniMeABI, RegisterABI, wMANA } from '../modules/contracts'
import { getEnvironmentChainId } from '../modules/votes/utils'

function createContract(eth: Eth | null, abi: unknown, address: string | null | undefined, fromAccount: string | null) {
  if (!eth || !address || !fromAccount) {
    return null
  }

  return new Contract(eth, new ContractAbi(abi as ContractAbiDefinition), Address.fromString(address), {
    from: Address.fromString(fromAccount),
  })
}

export function useEth() {
  const [, { provider }] = useAuthContext()
  return useMemo(() => provider && new Eth(provider), [provider])
}

export function useManaContract() {
  const eth = useEth()
  const [account] = useAuthContext()
  const chainId = getEnvironmentChainId()
  return useMemo(() => createContract(eth, ERC20ABI, MANA[chainId], account), [eth, account, chainId])
}

export function useWManaContract() {
  const eth = useEth()
  const [account] = useAuthContext()
  const chainId = getEnvironmentChainId()
  return useMemo(() => createContract(eth, MiniMeABI, wMANA[chainId], account), [eth, account, chainId])
}

export function useLandContract() {
  const eth = useEth()
  const [account, { chainId }] = useAuthContext()
  return useMemo(() => createContract(eth, RegisterABI, LAND[chainId!], account), [eth, account, chainId])
}

export function useBalanceOf(contract: Contract | null, account: string | null, unit: keyof typeof unitMap = 'wei') {
  return useAsyncMemo<number>(
    async () => {
      if (!account || !contract) {
        return 0
      }

      const balance = await contract.methods.balanceOf(account).call()
      return Math.floor(Number(fromWei(balance, unit)))
    },
    [contract, account],
    { callWithTruthyDeps: true, initialValue: 0 }
  )
}

export function useEstateContract() {
  const eth = useEth()
  const [account, { chainId }] = useAuthContext()
  return useMemo(() => createContract(eth, RegisterABI, ESTATE[chainId!], account), [eth, account, chainId])
}

export function useEstateBalance(
  contract: Contract | null,
  account: string | null,
  unit: keyof typeof unitMap = 'wei'
) {
  const [balance, state] = useAsyncMemo<[number, number]>(
    async () => {
      if (!account || !contract) {
        return [0, 0]
      }

      const [estates, lands] = await Promise.all([
        contract.methods.balanceOf(account).call(),
        contract.methods.getLANDsSize(account).call(),
      ])

      return [Math.floor(Number(fromWei(estates, unit))), Math.floor(Number(fromWei(lands, unit)))]
    },
    [contract, account],
    { callWithTruthyDeps: true, initialValue: [0, 0] }
  )

  return [(balance && balance[0]) || 0, (balance && balance[1]) || 0, state] as const
}
