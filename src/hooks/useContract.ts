import { useMemo } from 'react'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { Eth } from 'web3x/eth'
import { Address } from 'web3x/address'
import { Contract, ContractAbi, ContractAbiDefinition } from 'web3x/contract'
import { fromWei } from 'web3x/utils/units'
import { ERC20ABI, EstateProxy, EstateRegistry, LANDProxy, LANDRegistry, MANAMiniMeToken, MANAToken, MiniMeABI, RegisterABI } from '../modules/contracts'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'

function createContract(eth: Eth | null, abi: any, address: string | null | undefined, fromAccount: string | null ) {
  if (!eth || !address || !fromAccount) {
    return null
  }

  return new Contract(eth, new ContractAbi(abi as ContractAbiDefinition), Address.fromString(address), { from: Address.fromString(fromAccount) })
}

export function useEth() {
  const [ , { provider } ] = useAuthContext()
  return useMemo(() => provider && new Eth(provider), [ provider ])
}

export function useManaContract() {
  const eth = useEth()
  const [ account, { chainId } ] = useAuthContext()
  return useMemo(() => createContract(eth, ERC20ABI, MANAToken[chainId!], account), [ eth, account, chainId ])
}

export function useWManaContract() {
  const eth = useEth()
  const [ account, { chainId } ] = useAuthContext()
  return useMemo(() => createContract(eth, MiniMeABI, MANAMiniMeToken[chainId!], account), [ eth, account, chainId ])
}

export function useLandContract() {
  const eth = useEth()
  const [ account, { chainId } ] = useAuthContext()
  return useMemo(() => createContract(eth, RegisterABI, LANDProxy[chainId!] || LANDRegistry[chainId!], account), [ eth, account, chainId ])
}

export function useBalanceOf(contract: Contract | null) {
  const [ account ] = useAuthContext()
  return useAsyncMemo<number>(async () => {
      if (!account || !contract) {
        return 0
      }

      const balance = await contract.methods.balanceOf(account).call()
      return Math.floor(Number(fromWei(balance, 'ether')))
    },
    [ contract, account ],
    { callWithTruthyDeps: true, initialValue: 0 }
  )
}

export function useEstateContract() {
  const eth = useEth()
  const [ account, { chainId } ] = useAuthContext()
  return useMemo(() => createContract(eth, RegisterABI, EstateProxy[chainId!] || EstateRegistry[chainId!], account), [ eth, account, chainId ])
}


export function useEstateBalance() {
  const [ account ] = useAuthContext()
  const contract = useEstateContract()
  const [ balance, state ] = useAsyncMemo<[number, number]>(async () => {
      if (!account || !contract) {
        return [0, 0]
      }

      const [ estates, lands ] = await Promise.all([
        contract.methods.balanceOf(account).call(),
        contract.methods.getLANDsSize(account).call(),
      ])

      return [
        Math.floor(Number(fromWei(estates, 'ether'))),
        Math.floor(Number(fromWei(lands, 'ether'))),
      ]
    },
    [ contract, account ],
    { callWithTruthyDeps: true, initialValue: [0, 0] }
  )

  return [
    balance && balance[0] || 0,
    balance && balance[1] || 0,
    state
  ] as const
}