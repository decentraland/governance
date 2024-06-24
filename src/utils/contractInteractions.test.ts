import { isTransactionReplacedError, isTransactionUnderpricedError } from './contractInteractions'

const TRANSACTION_REPLACED_SAMPLE_ERROR = {
  reason: 'replaced',
  code: 'TRANSACTION_REPLACED',
  cancelled: true,
  replacement: {
    hash: '0xe7ffa574ee4cec34e74595dca1770bfecadc0bde94ffae422a013633cbdaac6c',
    type: 2,
    accessList: [],
    blockHash: '0x41100e94098a6bd91770b0bc6d1982a3ad9684d97f3705037581fd6b496112d1',
    blockNumber: 48923006,
    transactionIndex: 6,
    confirmations: 2,
    from: '0xc207F7Bf54541426E384f81B57EF6f55263E294d',
    gasPrice: { type: 'BigNumber', hex: '0x12f7eb41ac' },
    maxPriorityFeePerGas: { type: 'BigNumber', hex: '0x12f7eb41ac' },
    maxFeePerGas: { type: 'BigNumber', hex: '0x12f7eb41ac' },
    gasLimit: { type: 'BigNumber', hex: '0x012ea9' },
    to: '0x147e0dF40fdD1340C604726c670329c08176F208',
    value: { type: 'BigNumber', hex: '0x00' },
    nonce: 116,
    data: '0x7c402f8d0000000000000000000000000000000000000000000000000000000000000005c23d0efa74dcde9fd84e4eacef678b59794308124d9c8dae14746748b4977eeb0000000000000000000000000000000000000000000000000000000000000002',
    r: '0x383f10964ca16151b15d9c3936fad527c3c7cbc2d1a7a36dd5341b1f6fd7d330',
    s: '0x1083b3f242c7c0af1db5fbacb7cfc942e8f1c5567bb0786bc0cc0109d9a52699',
    v: 1,
    creates: null,
    chainId: 137,
  },
  hash: '0xe4f5c788a87c3da6304bf4d6f7a8383d98712f19a4497d51abffe1d320ac6f12',
  receipt: {
    to: '0x147e0dF40fdD1340C604726c670329c08176F208',
    from: '0xc207F7Bf54541426E384f81B57EF6f55263E294d',
    contractAddress: null,
    transactionIndex: 6,
    gasUsed: { type: 'BigNumber', hex: '0x012bb6' },
    logsBloom:
      '0x04000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000800000000400000000000000000000800000000000000000000100000000000000000000200000000000008000000004000000000000000080000000000000000040004000040000000000000000000000000000000000000000000000000000200000000000002000000100000000000000000000000000000000000000004000000000000000000001000200000000000000000000000000120000000000000000000000000000000000040000000000000000008000000000004000100001',
    blockHash: '0x41100e94098a6bd91770b0bc6d1982a3ad9684d97f3705037581fd6b496112d1',
    transactionHash: '0xe7ffa574ee4cec34e74595dca1770bfecadc0bde94ffae422a013633cbdaac6c',
    logs: [
      {
        transactionIndex: 6,
        blockNumber: 48923006,
        transactionHash: '0xe7ffa574ee4cec34e74595dca1770bfecadc0bde94ffae422a013633cbdaac6c',
        address: '0x147e0dF40fdD1340C604726c670329c08176F208',
        topics: [
          '0xfa784c48260e8db512de5f055a2f29eced211a7b3bd6338058b095ada7354cee',
          '0xc23d0efa74dcde9fd84e4eacef678b59794308124d9c8dae14746748b4977eeb',
          '0x000000000000000000000000c207f7bf54541426e384f81b57ef6f55263e294d',
          '0x0000000000000000000000000000000000000000000000000000000000000002',
        ],
        data: '0x',
        logIndex: 16,
        blockHash: '0x41100e94098a6bd91770b0bc6d1982a3ad9684d97f3705037581fd6b496112d1',
      },
      {
        transactionIndex: 6,
        blockNumber: 48923006,
        transactionHash: '0xe7ffa574ee4cec34e74595dca1770bfecadc0bde94ffae422a013633cbdaac6c',
        address: '0x0000000000000000000000000000000000001010',
        topics: [
          '0x4dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63',
          '0x0000000000000000000000000000000000000000000000000000000000001010',
          '0x000000000000000000000000c207f7bf54541426e384f81b57ef6f55263e294d',
          '0x0000000000000000000000009ead03f7136fc6b4bdb0780b00a1c14ae5a8b6d0',
        ],
        data: '0x00000000000000000000000000000000000000000000000000134463a2c71886000000000000000000000000000000000000000000000002eea5722d0c136bee0000000000000000000000000000000000000000000003a695483ddeb9ab6ba2000000000000000000000000000000000000000000000002ee922dc9694c53680000000000000000000000000000000000000000000003a6955b82425c728428',
        logIndex: 17,
        blockHash: '0x41100e94098a6bd91770b0bc6d1982a3ad9684d97f3705037581fd6b496112d1',
      },
    ],
    blockNumber: 48923006,
    confirmations: 2,
    cumulativeGasUsed: { type: 'BigNumber', hex: '0x1b8742' },
    effectiveGasPrice: { type: 'BigNumber', hex: '0x12f7eb41ac' },
    status: 1,
    type: 2,
    byzantium: true,
  },
}

const REPLACEMENT_UNDERPRICED_SAMPLE_ERROR = {
  reason: 'replacement fee too low',
  code: 'REPLACEMENT_UNDERPRICED',
  error: {
    reason: 'processing response error',
    code: 'SERVER_ERROR',
    body: '{"jsonrpc":"2.0","id":53,"error":{"code":-32000,"message":"replacement transaction underpriced"}}',
    error: { code: -32000 },
    requestBody: '{"method":"eth_sendRawTransaction","params":[""],"id":53,"jsonrpc":"2.0"}',
    requestMethod: 'POST',
    url: '',
  },
  method: 'sendTransaction',
  transaction: {},
  transactionHash: '',
}
const UNPREDICTABLE_GAS_LIMIT_SAMPLE_ERROR = {
  reason: 'cannot estimate gas; transaction may fail or may require manual gas limit',
  code: 'UNPREDICTABLE_GAS_LIMIT',
  error: {
    reason: 'execution reverted: airdrop: unauthorized',
    code: 'UNPREDICTABLE_GAS_LIMIT',
    method: 'estimateGas',
    transaction: {},
    error: {
      reason: 'processing response error',
      code: 'SERVER_ERROR',
      body: '{"jsonrpc":"2.0","id":49,"error":{"code":3,"data":"0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001561697264726f703a20756e617574686f72697a65640000000000000000000000","message":"execution reverted: airdrop: unauthorized"}}',
      error: {
        code: 3,
        data: '0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001561697264726f703a20756e617574686f72697a65640000000000000000000000',
      },
      requestBody:
        '{"method":"eth_estimateGas","params":[{"type":"0x2","maxFeePerGas":"0x18291e812a","maxPriorityFeePerGas":"0x59682f00","from":"0xbf363aedd082ddd8db2d6457609b03f9ee74a2f1","to":"0x147e0df40fdd1340c604726c670329c08176f208","data":""}],"id":49,"jsonrpc":"2.0"}',
      requestMethod: 'POST',
      url: '',
    },
  },
  tx: {},
}
const UNKNOWN_ERROR_SAMPLE = {
  code: 'OTHER_ERROR',
  message: 'Something else went wrong',
}
describe('isTransactionUnderpricedError', () => {
  it('identifies a direct underpriced transaction error', () => {
    expect(isTransactionUnderpricedError(REPLACEMENT_UNDERPRICED_SAMPLE_ERROR)).toBe(true)
  })

  it('identifies a nested underpriced transaction error', () => {
    const error = {
      error: {
        error: {
          code: -32000,
          reason: 'replacement fee too low',
        },
      },
    }
    expect(isTransactionUnderpricedError(error)).toBe(true)
  })

  it('returns false for other errors', () => {
    expect(isTransactionUnderpricedError(UNPREDICTABLE_GAS_LIMIT_SAMPLE_ERROR)).toBe(false)
    expect(isTransactionUnderpricedError(TRANSACTION_REPLACED_SAMPLE_ERROR)).toBe(false)
    expect(isTransactionUnderpricedError(UNKNOWN_ERROR_SAMPLE)).toBe(false)
  })

  it('handles null and undefined errors gracefully', () => {
    expect(isTransactionUnderpricedError(null)).toBe(false)
    expect(isTransactionUnderpricedError(undefined)).toBe(false)
    expect(isTransactionUnderpricedError({})).toBe(false)
  })
})

describe('isTransactionReplacedError', () => {
  it('identifies a direct replaced transaction error', () => {
    expect(isTransactionReplacedError(TRANSACTION_REPLACED_SAMPLE_ERROR)).toBe(true)
  })

  it('identifies a nested replaced transaction error', () => {
    const error = { error: { error: { code: 'TRANSACTION_REPLACED' } } }
    expect(isTransactionReplacedError(error)).toBe(true)
  })

  it('returns false for unrelated errors', () => {
    expect(isTransactionReplacedError(UNKNOWN_ERROR_SAMPLE)).toBe(false)
    expect(isTransactionReplacedError(REPLACEMENT_UNDERPRICED_SAMPLE_ERROR)).toBe(false)
    expect(isTransactionReplacedError(UNPREDICTABLE_GAS_LIMIT_SAMPLE_ERROR)).toBe(false)
  })

  it('handles null and undefined errors gracefully', () => {
    expect(isTransactionReplacedError(null)).toBe(false)
    expect(isTransactionReplacedError(undefined)).toBe(false)
    expect(isTransactionReplacedError({})).toBe(false)
  })
})
