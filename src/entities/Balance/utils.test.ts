import { ChainId } from '@dcl/schemas'
import {
  getBlockNumber,
  latestConsistentBlockNumber,
  getTokenBalancesFor,
  getNativeBalance,
  calculateTotalsByToken, NATIVE_CONTRACT, getBalancesByWallet
} from './utils'
import { asNumber } from '../Proposal/utils'
import { Alchemy } from '../../api/Alchemy'
import AlchemyMock, { someTokensWithError, allTokensWithError } from '../../api/__mock__/Alchemy'
import TokenModel from '../Token/model'
import {
  mockedTokens,
  token1,
  token2,
  ethereumWallet,
  maticWallet,
  mockedLatestBalances, mockedWallets
} from './__mock__/mockedBalances.test'
import { TokenAttributes } from '../Token/types'
import WalletModel from '../Wallet/model'
import { WalletAttributes } from '../Wallet/types'
import Time from 'decentraland-gatsby/dist/utils/date/Time'

// @ts-ignore
jest.spyOn(Alchemy, 'get').mockImplementation(() => AlchemyMock.get(ChainId.ETHEREUM_MAINNET));
jest.spyOn(TokenModel, 'find').mockResolvedValue([token1, token2])
jest.spyOn(TokenModel, 'getContracts').mockResolvedValue(mockedTokens.filter(t => t.contract != NATIVE_CONTRACT).map(c => c.contract))

function mockFindToken() {
  jest.spyOn(TokenModel, 'findToken').mockImplementation((id: string) => {
    const foundToken: TokenAttributes = mockedTokens.find(t => t.id == id)!
    return new Promise<TokenAttributes>((resolve) => {
      return resolve(foundToken)
    })
  })
}

function mockFindWallet() {
  jest.spyOn(WalletModel, 'findWallet').mockImplementation((id: string) => {
    const foundWallet: WalletAttributes = mockedWallets.find(w => w.id == id)!
    return new Promise<WalletAttributes>((resolve) => {
      return resolve(foundWallet)
    })
  })
}

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
          'contractAddress': 'NATIVE',
          'error': null,
          'tokenBalance': '0x27007b89f926e00'
        })
      });
    });

    describe('when the wallet is a matic wallet', () => {
      it('should return the matic token balance', async () => {
        let nativeBalance = await getNativeBalance(maticWallet)
        expect(nativeBalance).toEqual({
          'contractAddress': 'NATIVE',
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
          'contractAddress': 'NATIVE',
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
            'contractAddress': 'NATIVE',
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
    it('should return the total for each token plus the balances for each wallet', async () => {
      mockFindToken()

      let totalsByTokens = await calculateTotalsByToken(mockedLatestBalances)
      expect(totalsByTokens).toEqual([
        {
          token: 'mana',
          symbol: 'MANA',
          totalAmount: '0x0000000000000000000000000000000000000000001a75ad07cdbc88ae23fe63',
          decimals: 18
        },
        {
          token: 'usdc',
          symbol: 'USDC',
          totalAmount: '0x0000000000000000000000000000000000000000000000000000010e3b01de3f',
          decimals: 6
        },
        {
          token: 'dai',
          symbol: 'DAI',
          totalAmount: '0x0000000000000000000000000000000000000000000153d351d96434a1590535',
          decimals: 18
        },
        {
          token: 'tether',
          symbol: 'USDT',
          totalAmount: '0x000000000000000000000000000000000000000000000000000001c5abc59b05',
          decimals: 6
        },
        {
          decimals: 18,
          symbol: 'ETH',
          token: 'ether',
          totalAmount: '0x00000000000000000000000000000000000000000000000047832dbdc6f18363'
        },
        {
          decimals: 18,
          symbol: 'MATIC',
          token: 'matic',
          totalAmount: '0x000000000000000000000000000000000000000000000000456391829a495555'
        }
      ])
    });
  });

  describe('getBalancesByWallet', () => {
    it('should return the balances for each token in each wallet', async () => {
      mockFindToken()
      mockFindWallet()

      let balancesByWallet = await getBalancesByWallet(mockedLatestBalances)
      expect(balancesByWallet).toEqual([
        {
          wallet: {
            id: '1',
            address: '0x9a6ebe7e2a7722f8200d0ffb63a1f6406a0d7dce',
            name: 'Aragon Agent',
            network: 1,
            created_at: Time.date('2021-12-27 01:32:06.533142 +00:00')
          },
          tokenBalances: [
            {
              name: 'matic',
              decimals: 18,
              amount: '0x0000000000000000000000000000000000000000000000000000000055555555'
            },
            {
              name: 'dai',
              decimals: 18,
              amount: '0x0000000000000000000000000000000000000000000153d102070746599ee535'
            },
            {
              name: 'tether',
              decimals: 6,
              amount: '0x0000000000000000000000000000000000000000000000000000015141731305'
            },
            {
              name: 'usdc',
              decimals: 6,
              amount: '0x0000000000000000000000000000000000000000000000000000010e39baf2d7'
            },
            {
              name: 'ether',
              decimals: 18,
              amount: '0x27007b89f926e00'
            },
            {
              name: 'mana',
              decimals: 18,
              amount: '0x00000000000000000000000000000000000000000019e96b1308538a0a1e6663'
            }
          ]
        },
        {
          wallet: {
            address: '0x89214c8Ca9A49E60a3bfa8e00544F384C93719b1',
            created_at: Time.date('2021-12-27 01:32:06.533142 +00:00'),
            id: '2',
            name: 'Gnosis Safe',
            network: 1
          },
          tokenBalances: [
            {
              name: 'mana',
              decimals: 18,
              amount: '0x0000000000000000000000000000000000000000000000db4af39d52eb511800'
            },
            {
              name: 'matic',
              decimals: 18,
              amount: '0x0000000000000000000000000000000000000000000000000000000000000000'
            },
            {
              name: 'dai',
              decimals: 18,
              amount: '0x0000000000000000000000000000000000000000000000000000000000000000'
            },
            {
              name: 'tether',
              decimals: 6,
              amount: '0x000000000000000000000000000000000000000000000000000000746a528800'
            },
            {
              name: 'usdc',
              decimals: 6,
              amount: '0x0000000000000000000000000000000000000000000000000000000000000000'
            },
            {
              name: 'ether',
              decimals: 18,
              amount: '0x45132605275f1563'
            }
          ]
        },
        {
          wallet: {
            address: '0xB08E3e7cc815213304d884C88cA476ebC50EaAB2',
            created_at: Time.date('2021-12-27 01:32:06.533142 +00:00'),
            id: '3',
            name: 'Gnosis Safe',
            network: 137
          },
          tokenBalances: [
            {
              name: 'mana',
              decimals: 18,
              amount: '0x000000000000000000000000000000000000000000008b66a9d1cbabb8b48000'
            },
            {
              name: 'dai',
              decimals: 18,
              amount: '0x0000000000000000000000000000000000000000000000024fd25cee47ba2000'
            },
            {
              decimals: 6,
              name: 'tether',
              amount: '0x0000000000000000000000000000000000000000000000000000000000000000'
            },
            {
              name: 'usdc',
              decimals: 6,
              amount: '0x000000000000000000000000000000000000000000000000000000000146eb68'
            },
            {
              name: 'matic',
              decimals: 18,
              amount: '0x4563918244f40000'
            }
          ]
        }]
      )
    });
  });
})
