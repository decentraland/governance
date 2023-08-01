import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ethers } from 'ethers'

import DclRpcService from '../../services/DclRpcService'

const { abi: BadgesAbi } = require('@otterspace-xyz/contracts/out/Badges.sol/Badges.json')

const RAFT_OWNER_PK = process.env.RAFT_OWNER_PK || ''
const POLYGON_BADGES_CONTRACT_ADDRESS = process.env.POLYGON_BADGES_CONTRACT_ADDRESS || ''

function checksumAddresses(addresses: string[]): string[] {
  return addresses.map((address) => ethers.utils.getAddress(address))
}

const GAS_MULTIPLIER = 2
type GasConfig = { gasPrice: ethers.BigNumber; gasLimit: ethers.BigNumber }

export async function estimateGas(
  contract: Contract,
  formattedRecipients: string[],
  ipfsAddress: string,
  provider: JsonRpcProvider
): Promise<GasConfig> {
  const gasLimit = await contract.estimateGas.airdrop(formattedRecipients, ipfsAddress)
  const gasPrice = await provider.getGasPrice()
  const adjustedGasPrice = gasPrice.mul(GAS_MULTIPLIER)
  return {
    gasPrice: adjustedGasPrice,
    gasLimit,
  }
}

export async function airdrop(badgeCid: string, recipients: string[], pumpGas = false) {
  const provider = DclRpcService.polygon()
  const raftOwner = new ethers.Wallet(RAFT_OWNER_PK, provider)
  const contract = new ethers.Contract(POLYGON_BADGES_CONTRACT_ADDRESS, BadgesAbi, raftOwner)
  const ipfsAddress = `ipfs://${badgeCid}/metadata.json`
  const formattedRecipients = checksumAddresses(recipients)
  let txn
  if (pumpGas) {
    const gasConfig = await estimateGas(contract, formattedRecipients, ipfsAddress, provider)
    txn = await contract.connect(raftOwner).airdrop(formattedRecipients, ipfsAddress, gasConfig)
  } else {
    txn = await contract.connect(raftOwner).airdrop(formattedRecipients, ipfsAddress)
  }
  await txn.wait()
  console.log('Airdropped badge with txn hash:', txn.hash)
}

export async function checkBalance() {
  const provider = DclRpcService.polygon()
  const raftOwner = await new ethers.Wallet(RAFT_OWNER_PK, provider)
  const balance = await raftOwner.getBalance()
  const balanceInEther = ethers.utils.formatEther(balance)
  const balanceBigNumber = ethers.BigNumber.from(balance)
  console.log(`Balance of ${raftOwner.address}: ${balanceInEther} ETH = ${balanceBigNumber}`)
}
