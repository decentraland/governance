/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react'

import { hexlify } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'
import useAuth from 'decentraland-gatsby/dist/hooks/useAuth'

import { SNAPSHOT_SPACE } from '../entities/Snapshot/constants'
import DelegateABI from '../modules/contracts/abi/Delegate.abi.json'

export enum DelegateContractStatusCode {
  TRANSACTION_CANCELED_BY_USER = 4001,
  UNDEFINED_CONTRACT = -1,
  SUCCESS = 1,
}

const enc = new TextEncoder()
const spaceId = hexlify(enc.encode(SNAPSHOT_SPACE))
const fullSpaceId = spaceId.concat(new Array(66 - spaceId.length + 1).join('0'))
const DELEGATE_CONTRACT_ADDRESS = process.env.GATSBY_SNAPSHOT_DELEGATE_CONTRACT_ADDRESS
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
const GLOBAL_SPACE_ID = '0x0000000000000000000000000000000000000000000000000000000000000000'

const validateContract = <T>(contract: Contract | undefined, callback: (contract: Contract) => Promise<T>) => {
  if (!contract) {
    throw { code: DelegateContractStatusCode.UNDEFINED_CONTRACT, message: 'Delegate Contract is undefined' }
  }

  return callback(contract)
}

const validateResult = <T>(result: any, callback: (result: any) => T) => {
  if (!result || result.status !== DelegateContractStatusCode.SUCCESS) {
    throw { code: result.status, message: 'Transaction failed' }
  }

  return callback(result)
}

function useSnapshotDelegateContract() {
  const [userAddress, authState] = useAuth()
  const [delegatedAddress, setDelegatedAddress] = useState<string | undefined>()
  const [isGlobalDelegation, setGlobalDelegation] = useState(false)
  const [contract, setContract] = useState<Contract | undefined>()

  const provider = authState.provider || undefined
  const isContractUsable = !!provider && !!DELEGATE_CONTRACT_ADDRESS

  useEffect(() => {
    if (isContractUsable) {
      const signer = new Web3Provider(provider).getSigner()
      const newContract = new Contract(DELEGATE_CONTRACT_ADDRESS, DelegateABI, signer)
      setContract(newContract)
    }
  }, [isContractUsable])

  const setDelegate = useCallback(
    async (address: string) => {
      return validateContract(contract, async (contract) => {
        const transaction = await contract.setDelegate(fullSpaceId, address)
        const result = await transaction.wait()
        validateResult(result, () => {
          setDelegatedAddress(address)
        })
      })
    },
    [contract]
  )

  const clearDelegate = useCallback(async () => {
    return validateContract(contract, async (contract) => {
      const transaction = await contract.clearDelegate(fullSpaceId)
      const result = await transaction.wait()
      validateResult(result, () => {
        setDelegatedAddress(undefined)
      })
    })
  }, [contract])

  const checkDelegation = useCallback(async () => {
    return validateContract<string>(contract, async (contract) => {
      let address: string = await contract.delegation(userAddress, fullSpaceId)

      if (address === NULL_ADDRESS) {
        address = await contract.delegation(userAddress, GLOBAL_SPACE_ID)
        if (address !== NULL_ADDRESS) {
          setGlobalDelegation(true)
        }
      }

      setDelegatedAddress(address !== NULL_ADDRESS ? address : undefined)

      return address
    })
  }, [contract, userAddress])

  useEffect(() => {
    if (contract) {
      checkDelegation()
    }
  }, [checkDelegation, contract, isContractUsable])

  return { isContractUsable, delegatedAddress, isGlobalDelegation, setDelegate, clearDelegate, checkDelegation }
}

export default useSnapshotDelegateContract
