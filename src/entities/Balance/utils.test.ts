import { ChainId } from '@dcl/schemas'
import {
  getBlockNumber,
  latestConsistentBlockNumber,
  getTokenBalancesFor,
  getNativeBalance,
  getAggregatedBalances
} from './utils'
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

  describe('getTokenBalancesFor', () => {
    it('should return a list with the balance of each token in the wallet and the native balance', async () => {
      let tokenBalances = await getTokenBalancesFor(ethereumWallet)
      expect(tokenBalances).toEqual([
        {
          'contractAddress': token1.contract,
          'error': null,
          'tokenBalance': '0x00000000000000000000000000000000000000000019dcd03f58969775a16663'
        }, {
          'contractAddress': token2.contract,
          'error': null,
          'tokenBalance': '0x0000000000000000000000000000000000000000000153d102070746599ee535'
        }, {
          'contractAddress': 'ether',
          'error': null,
          'tokenBalance': '0x27007b89f926e00'
        }
      ])
    });

    describe('when there is an error while fetching a token balance', () => {
      beforeEach(() => {
        jest.spyOn(AlchemyMock.prototype, 'getTokenBalances').mockResolvedValue(someTokensWithError);
      })
      it('only returns the token balances successfully obtained ', async () => {
        let tokenBalances = await getTokenBalancesFor(ethereumWallet)
        expect(tokenBalances).toEqual([
          {
            'contractAddress': token2.contract,
            'error': null,
            'tokenBalance': '0x0000000000000000000000000000000000000000000153d102070746599ee535'
          }, {
            'contractAddress': 'ether',
            'error': null,
            'tokenBalance': '0x27007b89f926e00'
          }
        ])
      });
    });

    describe('when there is no token balance available', () => {
      beforeEach(() => {
        jest.spyOn(AlchemyMock.prototype, 'getTokenBalances').mockResolvedValue(allTokensWithError);
      })
      it('should only return the native token balance', async () => {
        let tokenBalances = await getTokenBalancesFor(ethereumWallet)
        let nativeBalance = await getNativeBalance(ethereumWallet)
        expect(tokenBalances).toEqual([nativeBalance])
      });
    });
  });

  describe('calculateTotalsByToken', () => {
    it('should return the total for each token plus the balances for each wallet', () => {
      expect(getAggregatedBalances()).toEqual(
        {
          totalsByToken: [
            {
              token: 'mana',
              symbol: 'MANA',
              totalAmount: '0x10',
              decimals: 18
            },
            {
              token: 'usdc',
              symbol: 'USDC',
              totalAmount: '0x11',
              decimals: 6
            },
            {
              token: 'dai',
              symbol: 'DAI',
              totalAmount: '0x12',
              decimals: 18
            },
            {
              token: 'tether',
              symbol: 'USDT',
              totalAmount: '0x13',
              decimals: 6
            }],
          walletBalances: [
            {
              walletName: 'Aragon Agent',
              network: 1,
              address: "0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce",
              tokenBalance: [
                {
                  token: 'mana',
                  balance: '0x00000000000000000000000000000000000000000019e6973c9090d9ed916663'
                }, {
                  token: 'usdc',
                  balance: '0x0000000000000000000000000000000000000000000000000000010e39baf2d7'
                },
                {
                  token: 'dai',
                  balance: '0x0000000000000000000000000000000000000000000153d102070746599ee535'
                },
                {
                  token: 'usdt',
                  balance: '0x0000000000000000000000000000000000000000000000000000015141731305'
                }]
            },
            {
              walletName: 'Gnosis Safe',
              network: 1,
              address: "0x89214c8Ca9A49E60a3bfa8e00544F384C93719b1",
              tokenBalance: [
                {
                  token: 'mana',
                  balance: '0x0000000000000000000000000000000000000000000000db4af39d52eb511800'
                }, {
                  token: 'usdc',
                  balance: '0x0000000000000000000000000000000000000000000000000000000000000000'
                },
                {
                  token: 'dai',
                  balance: '0x0000000000000000000000000000000000000000000000000000000000000000'
                },

                {
                  token: 'usdt',
                  balance: '0x000000000000000000000000000000000000000000000000000000746a528800'
                }]
            },
            {
              walletName: 'Gnosis Safe',
              network: 137,
              address: "0xB08E3e7cc815213304d884C88cA476ebC50EaAB2",
              tokenBalance: [
                {
                  token: 'mana',
                  balance: '0x0000000000000000000000000000000000000000000089d2a64f55b763eac000'
                }, {
                  token: 'usdc',
                  balance: '0x000000000000000000000000000000000000000000000000000000000146eb68'
                },
                {
                  token: 'dai',
                  balance: '0x000000000000000000000000000000000000000000000001ac82eaa76c1fc000'
                }, {
                  token: 'usdt',
                  balance: '0x0000000000000000000000000000000000000000000000000000000000000000'
                }]
            }
          ]}
    )
    });
  });
})
