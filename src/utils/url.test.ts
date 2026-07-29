import { isSafeWebUrl } from './url'

describe('isSafeWebUrl', () => {
  describe.each(['https://example.com/path', 'http://example.com/path'])('when the URL is %s', (value) => {
    it('should accept the URL', () => {
      expect(isSafeWebUrl(value)).toBe(true)
    })
  })

  describe.each(['javascript:alert(document.domain)', 'data:text/html,unsafe', 'file:///etc/passwd', 'not a url'])(
    'when the value is %s',
    (value) => {
      it('should reject the value', () => {
        expect(isSafeWebUrl(value)).toBe(false)
      })
    }
  )
})
