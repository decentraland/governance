import dns from 'dns'

import { assertPublicUrl, isPrivateIp } from './common'

describe('isPrivateIp', () => {
  describe('when given IPv4 addresses in a private, loopback, link-local or CGNAT range', () => {
    const privateV4 = ['0.0.0.1', '10.1.2.3', '127.0.0.1', '169.254.169.254', '172.16.0.1', '192.168.1.1', '100.64.0.1']

    it('should classify every one of them as private', () => {
      expect(privateV4.map(isPrivateIp)).toEqual(privateV4.map(() => true))
    })
  })

  describe('when given public IPv4 addresses', () => {
    const publicV4 = ['8.8.8.8', '1.1.1.1', '172.32.0.1', '93.184.216.34']

    it('should classify every one of them as public', () => {
      expect(publicV4.map(isPrivateIp)).toEqual(publicV4.map(() => false))
    })
  })

  describe('when given the IPv6 loopback address written in different valid forms', () => {
    const loopbackForms = ['::1', '0::1', '::0:1', '0:0:0:0:0:0:0:1']

    it('should classify every spelling as private', () => {
      expect(loopbackForms.map(isPrivateIp)).toEqual(loopbackForms.map(() => true))
    })
  })

  describe('when given IPv6 link-local, unique-local or unspecified addresses', () => {
    const privateV6 = ['fe80::1', 'fe80:0:0:0:0:0:0:1', 'fc00::1', 'fd12:3456::1', '::']

    it('should classify every one of them as private', () => {
      expect(privateV6.map(isPrivateIp)).toEqual(privateV6.map(() => true))
    })
  })

  describe('when given IPv4-mapped IPv6 addresses', () => {
    it('should classify a mapped private address as private', () => {
      expect(isPrivateIp('::ffff:127.0.0.1')).toBe(true)
    })

    it('should classify a mapped public address as public', () => {
      expect(isPrivateIp('::ffff:8.8.8.8')).toBe(false)
    })
  })

  describe('when given public IPv6 addresses', () => {
    const publicV6 = ['2001:4860:4860::8888', '2606:4700:4700::1111']

    it('should classify every one of them as public', () => {
      expect(publicV6.map(isPrivateIp)).toEqual(publicV6.map(() => false))
    })
  })
})

describe('assertPublicUrl', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the host is an IP literal in a private range', () => {
    it('should reject an IPv4 loopback literal', async () => {
      await expect(assertPublicUrl('https://127.0.0.1/admin')).rejects.toThrow('private')
    })

    it('should reject an IPv6 loopback literal written in expanded form', async () => {
      await expect(assertPublicUrl('https://[0:0:0:0:0:0:0:1]/')).rejects.toThrow('private')
    })
  })

  describe('when the host is a public IP literal', () => {
    it('should resolve without throwing', async () => {
      await expect(assertPublicUrl('https://1.1.1.1/')).resolves.toBeUndefined()
    })
  })

  describe('when the host is a domain that resolves to a private address', () => {
    beforeEach(() => {
      jest.spyOn(dns.promises, 'lookup').mockResolvedValue([{ address: '10.0.0.5', family: 4 }] as never)
    })

    it('should reject because the resolved address is private', async () => {
      await expect(assertPublicUrl('https://internal.example/')).rejects.toThrow('private address')
    })
  })

  describe('when the host is a domain that resolves only to public addresses', () => {
    beforeEach(() => {
      jest.spyOn(dns.promises, 'lookup').mockResolvedValue([{ address: '93.184.216.34', family: 4 }] as never)
    })

    it('should resolve without throwing', async () => {
      await expect(assertPublicUrl('https://example.com/')).resolves.toBeUndefined()
    })
  })

  describe('when the host is a domain that resolves to a mix of public and private addresses', () => {
    beforeEach(() => {
      jest.spyOn(dns.promises, 'lookup').mockResolvedValue([
        { address: '93.184.216.34', family: 4 },
        { address: '169.254.169.254', family: 4 },
      ] as never)
    })

    it('should reject because at least one resolved address is private', async () => {
      await expect(assertPublicUrl('https://rebind.example/')).rejects.toThrow('private address')
    })
  })
})
