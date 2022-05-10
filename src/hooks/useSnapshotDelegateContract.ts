import { hexlify } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'
import useAuth from 'decentraland-gatsby/dist/hooks/useAuth'
import { useMemo } from 'react'
import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import DelegateABI from '../modules/contracts/abi/Delegate.abi.json'

function useSnapshotDelegateContract() {

  const [userAddress, authState] = useAuth()

  return useMemo(() => {

    let isContractUsable = false
    let setDelegate = null
    let clearDelegate = null
    let checkDelegation = null

    if (authState.provider) {
      const enc = new TextEncoder()
      const signer = new Web3Provider(authState.provider).getSigner()
      const spaceId = hexlify(enc.encode(SNAPSHOT_SPACE))
      const fullSpaceId = spaceId.concat(new Array(66 - spaceId.length + 1).join('0'))
      const contractAddress = process.env.GATSBY_SNAPSHOT_DELEGATE_CONTRACT_ADDRESS || ''
      const contract = new Contract(contractAddress, DelegateABI, signer)

      setDelegate = async (address: string) => contract.setDelegate(fullSpaceId, address)
      clearDelegate = async () => contract.clearDelegate(fullSpaceId)
      checkDelegation = async (): Promise<string> => contract.delegation(userAddress, fullSpaceId)
      isContractUsable = true
    }

    return { isContractUsable, setDelegate, clearDelegate, checkDelegation }
  }, [authState.provider])
}

export default useSnapshotDelegateContract