import { trimLastForwardSlash } from './utils'

describe('trimLastForwardSlash', () => {
  it('should return the string without the last forward slash', () => {
    expect(trimLastForwardSlash('https://hub.snapshot.org')).toStrictEqual('https://hub.snapshot.org')
    expect(trimLastForwardSlash('https://hub.snapshot.org/')).toStrictEqual('https://hub.snapshot.org')
    expect(trimLastForwardSlash('https://testnet.snapshot.org/')).toStrictEqual('https://testnet.snapshot.org')
    expect(trimLastForwardSlash('https://testnet.snapshot.org')).toStrictEqual('https://testnet.snapshot.org')
  })
})
