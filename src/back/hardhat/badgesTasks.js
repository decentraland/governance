const dotenv = require('dotenv')
const { airdrop } = require('./badgesUtils')
const { task } = require('hardhat/config')
dotenv.config()

task('airdrop', 'Airdrops a badge')
  .addParam('badgecid', 'The CID of the badge in IPFS')
  .addParam('recipients')
  .setAction(async (taskArgs, hre) => {
    const { badgecid, recipients } = taskArgs
    await airdrop(hre, badgecid, recipients)
  })

module.exports = {
  airdrop: 'airdrop',
}
