import { ChainId } from '@dcl/schemas'
import { getBlockNumber, latestConsistentBlockNumber, getWalletBalance, getNativeBalance } from './utils'
import { asNumber } from '../Proposal/utils'
import { Alchemy } from '../../api/Alchemy'
import AlchemyMock, {
  token1,
  token2,
  ethereumWallet,
  someTokensWithError,
  maticWallet,
  allTokensWithError
} from '../../api/__mock__/Alchemy'
import TokenModel from '../Token/model'

// @ts-ignore
jest.spyOn(Alchemy, 'get').mockImplementation(() => AlchemyMock.get(ChainId.ETHEREUM_MAINNET));
jest.spyOn(TokenModel, 'find').mockResolvedValue([token1, token2])

describe('balances', () => {

  describe('getBlockNumber', () => {
    it('returns a hex string representing the block number', async () => {
      expect(await getBlockNumber(ChainId.ETHEREUM_MAINNET)).toEqual('0xd352a6')
    });
  });

  describe('latestConsistentBlockNumber', () => {
    it('should return the latest block minus 256 as a hex', async () => {
      let latestConsistentBlock = await latestConsistentBlockNumber(ChainId.ETHEREUM_MAINNET)
      expect(latestConsistentBlock).toEqual((asNumber(0xd352a6) - 256).toString(16))
    });
  });

  describe('getNativeBalance', () => {
    describe('when the wallet is an ethereum wallet', () => {
      it('should return the ether token balance', async () => {
        let nativeBalance = await getNativeBalance(ethereumWallet)
        expect(nativeBalance).toEqual({
          'contractAddress': 'ether',
          'error': null,
          'tokenBalance': '0x27007b89f926e00'
        })
      });
    });

    describe('when the wallet is a matic wallet', () => {
      it('should return the matic token balance', async () => {
        let nativeBalance = await getNativeBalance(maticWallet)
        expect(nativeBalance).toEqual({
          'contractAddress': 'matic',
          'error': null,
          'tokenBalance': '0x27007b89f926e00'
        })
      });
    });
  });

  describe('getWalletBalance', () => {
    it('should return a list with the balance of each token in the wallet and the native balance', async () => {
      let tokenBalances = await getWalletBalance(ethereumWallet)
      let nativeBalance = await getNativeBalance(ethereumWallet)
      expect(tokenBalances).toEqual([
        {
          'contractAddress': token1.contract,
          'error': null,
          'tokenBalance': '0x00000000000000000000000000000000000000000019dcd03f58969775a16663'
        }, {
          'contractAddress': token2.contract,
          'error': null,
          'tokenBalance': '0x0000000000000000000000000000000000000000000153d102070746599ee535'
        },
        nativeBalance
      ])
    });

    describe('when there is an error while fetching a token balance', () => {
      beforeEach(() => {
        jest.spyOn(AlchemyMock.prototype, 'getTokenBalances').mockResolvedValue(someTokensWithError);
      })
      it('only returns the token balances successfully obtained ', async () => {
        let tokenBalances = await getWalletBalance(ethereumWallet)
        let nativeBalance = await getNativeBalance(ethereumWallet)
        expect(tokenBalances).toEqual([
          {
            'contractAddress': token2.contract,
            'error': null,
            'tokenBalance': '0x0000000000000000000000000000000000000000000153d102070746599ee535'
          },
          nativeBalance
        ])
      });
    });

    describe('when there is no token balance available', () => {
      beforeEach(() => {
        jest.spyOn(AlchemyMock.prototype, 'getTokenBalances').mockResolvedValue(allTokensWithError);
      })
      it('should only return the native token balance', async () => {
        let tokenBalances = await getWalletBalance(ethereumWallet)
        let nativeBalance = await getNativeBalance(ethereumWallet)
        expect(tokenBalances).toEqual([nativeBalance])
      });
    });
  });
})

