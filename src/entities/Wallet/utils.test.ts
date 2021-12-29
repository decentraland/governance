import { WalletAttributes, NetworkScanLink } from './types'
import { gnosisSafeEth, gnosisSafeMatic } from '../Balance/__mock__/mockedBalances.test'
import { networkScanLink } from './utils'
import logger from 'decentraland-gatsby/dist/entities/Development/logger'


describe('networkScanLink', () => {
  let wallet:WalletAttributes
  logger.error = jest.fn()

  describe('when the wallet is from ethereum', () => {
    beforeEach(() => {
      wallet = gnosisSafeEth
    })

    it('returns the correct etherscan name and link address', async () => {
      let scanLink:NetworkScanLink = networkScanLink(wallet)
      expect(scanLink.link).toEqual('https://etherscan.io/address/' + wallet.address)
      expect(scanLink.name).toEqual('Etherscan')
    });
  });

  describe('when the wallet is from matic', () => {
    beforeEach(() => {
      wallet = gnosisSafeMatic
    })

    it('returns the correct polygonscan name and link address', async () => {
      let scanLink:NetworkScanLink = networkScanLink(wallet)
      expect(scanLink.link).toEqual('https://polygonscan.com/address/' + wallet.address)
      expect(scanLink.name).toEqual('Polygonscan')
    });
  });

  describe('when the wallet has an unknown network', () => {
    beforeEach(() => {
      wallet = gnosisSafeMatic
      wallet.network = 123
    })

    it('logs the error and returns and empty name and address', async () => {
      let scanLink:NetworkScanLink = networkScanLink(wallet)
      expect(scanLink.link).toEqual('/')
      expect(scanLink.name).toEqual('')
      expect(logger.error).toHaveBeenCalled()
    });
  });
});
