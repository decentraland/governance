const dotenv = require('dotenv')
const { abi: BadgesAbi } = require('@otterspace-xyz/contracts/out/Badges.sol/Badges.json')

dotenv.config()

const airdrop = async (hre, badgeCid, recipients) => {
  const [owner] = await hre.ethers.getSigners()
  const contract = new hre.ethers.Contract(hre.network.config.badgesContractAddress, BadgesAbi, owner)
  const recipientsArray = recipients.split(',')
  const ipfsAddress = `ipfs://${badgeCid}/metadata.json`
  const txn = await contract.connect(owner).airdrop(recipientsArray, ipfsAddress)
  await txn.wait()
  console.log('Airdropped badge with txn hash:', txn.hash)
}

module.exports = {
  airdrop,
}
