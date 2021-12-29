import { ChainId } from '@dcl/schemas'
import {
  getBlockNumber,
  latestConsistentBlockNumber,
  getTokenBalancesFor,
  getNativeBalance,
  NATIVE_CONTRACT,
  aggregateBalances
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
  mockedLatestBalances, mockedWallets, gnosisSafeEth, gnosisSafeMatic, aragonAgent
} from './__mock__/mockedBalances.test'
import { TokenAttributes } from '../Token/types'
import WalletModel from '../Wallet/model'
import { WalletAttributes } from '../Wallet/types'

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

function mockTokenList() {
  jest.spyOn(TokenModel, 'getTokenList').mockImplementation(() => {
    let tokenArray: Partial<TokenAttributes>[] = []
    for (const token of mockedTokens) {
      if (!tokenArray.find(t => t.name == token.name)) {
        tokenArray.push({ name: token.name, decimals: token.decimals })
      }
    }
    return new Promise<Partial<TokenAttributes>[]>((resolve) => {
      return resolve(tokenArray)
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

  describe('aggregateBalances', () => {
    it('should return the total balance fot a token, and the balances for each token in each wallet', async () => {
      mockFindToken()
      mockFindWallet()
      mockTokenList()

      let tokenBalances = await aggregateBalances(mockedLatestBalances)
      expect(tokenBalances).toEqual([
        {
          tokenInWallets: [
            {
              tokenBalance: {
                amount: '0x0000000000000000000000000000000000000000000000db4af39d52eb511800',
                decimals: 18,
                name: 'mana'
              },
              wallet: gnosisSafeEth
            },
            {
              tokenBalance: {
                amount: '0x000000000000000000000000000000000000000000008b66a9d1cbabb8b48000',
                decimals: 18,
                name: 'mana'
              },
              wallet: gnosisSafeMatic
            },
            {
              tokenBalance: {
                amount: '0x00000000000000000000000000000000000000000019e96b1308538a0a1e6663',
                decimals: 18,
                name: 'mana'
              },
              wallet: aragonAgent
            }
          ],
          tokenTotal: {
            amount: '0x0000000000000000000000000000000000000000001a75ad07cdbc88ae23fe63',
            decimals: 18,
            name: 'mana'
          }
        },
        {
          tokenInWallets: [
            {
              tokenBalance: {
                amount: '0x0000000000000000000000000000000000000000000000000000000055555555',
                decimals: 18,
                name: 'matic'
              },
              wallet: aragonAgent
            },
            {
              tokenBalance: {
                amount: '0x0000000000000000000000000000000000000000000000000000000000000000',
                decimals: 18,
                name: 'matic'
              },
              wallet: gnosisSafeEth
            },
            {
              tokenBalance: {
                amount: '0x4563918244f40000',
                decimals: 18,
                name: 'matic'
              },
              wallet: gnosisSafeMatic
            }
          ],
          tokenTotal: {
            amount: '0x000000000000000000000000000000000000000000000000456391829a495555',
            decimals: 18,
            name: 'matic'
          }
        },
        {
          tokenInWallets: [
            {
              tokenBalance: {
                amount: '0x0000000000000000000000000000000000000000000153d102070746599ee535',
                decimals: 18,
                name: 'dai'
              },
              wallet: aragonAgent
            },
            {
              tokenBalance: {
                amount: '0x0000000000000000000000000000000000000000000000000000000000000000',
                decimals: 18,
                name: 'dai'
              },
              wallet: gnosisSafeEth
            },
            {
              tokenBalance: {
                amount: '0x0000000000000000000000000000000000000000000000024fd25cee47ba2000',
                decimals: 18,
                name: 'dai'
              },
              wallet: gnosisSafeMatic
            }
          ],
          tokenTotal: {
            amount: '0x0000000000000000000000000000000000000000000153d351d96434a1590535',
            decimals: 18,
            name: 'dai'
          }
        },
        {
          tokenInWallets: [
            {
              tokenBalance: {
                amount: '0x0000000000000000000000000000000000000000000000000000015141731305',
                decimals: 6,
                name: 'tether'
              },
              wallet: aragonAgent
            },
            {
              tokenBalance: {
                amount: '0x000000000000000000000000000000000000000000000000000000746a528800',
                decimals: 6,
                name: 'tether'
              },
              wallet: gnosisSafeEth
            },
            {
              tokenBalance: {
                amount: '0x0000000000000000000000000000000000000000000000000000000000000000',
                decimals: 6,
                name: 'tether'
              },
              wallet: gnosisSafeMatic
            }
          ],
          tokenTotal: {
            amount: '0x000000000000000000000000000000000000000000000000000001c5abc59b05',
            decimals: 6,
            name: 'tether'
          }
        },
        {
          tokenInWallets: [
            {
              tokenBalance: {
                amount: '0x0000000000000000000000000000000000000000000000000000010e39baf2d7',
                decimals: 6,
                name: 'usdc'
              },
              wallet: aragonAgent
            },
            {
              tokenBalance: {
                amount: '0x0000000000000000000000000000000000000000000000000000000000000000',
                decimals: 6,
                name: 'usdc'
              },
              wallet: gnosisSafeEth
            },
            {
              tokenBalance: {
                amount: '0x000000000000000000000000000000000000000000000000000000000146eb68',
                decimals: 6,
                name: 'usdc'
              },
              wallet: gnosisSafeMatic
            }
          ],
          tokenTotal: {
            amount: '0x0000000000000000000000000000000000000000000000000000010e3b01de3f',
            decimals: 6,
            name: 'usdc'
          }
        },
        {
          tokenInWallets: [
            {
              tokenBalance: {
                amount: '0x27007b89f926e00',
                decimals: 18,
                name: 'ether'
              },
              wallet: aragonAgent
            },
            {
              tokenBalance: {
                amount: '0x45132605275f1563',
                decimals: 18,
                name: 'ether'
              },
              wallet: gnosisSafeEth
            }
          ],
          tokenTotal: {
            amount: '0x00000000000000000000000000000000000000000000000047832dbdc6f18363',
            decimals: 18,
            name: 'ether'
          }
        }
      ])
    });
  });
})
