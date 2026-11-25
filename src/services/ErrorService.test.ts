import Rollbar from 'rollbar'

import logger from '../utils/logger'

import {
  ErrorService,
  getFingerprint,
  getRollbarConfig,
  redactPayload,
  serializeError,
  shouldIgnoreItem,
  toReportableError,
} from './ErrorService'

// rollbar's own transport, stubbed below so nothing leaves the test.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RollbarTransport = require('rollbar/src/server/transport')

// Reports only go to Rollbar in production with a token.
jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  GOVERNANCE_API: 'https://governance.decentraland.org/api',
  DAO_ROLLBAR_TOKEN: 'test-token',
  COMMIT_HASH: 'abc1234',
}))

const ALCHEMY_KEY = 'aBcDeFgHiJkLmNoPqRsTuVwXyZ012345'
const RPC_URL = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`

type Payload = { data: Record<string, unknown> & { body: Record<string, unknown>; custom?: Record<string, unknown> } }

function resetClient() {
  ;(ErrorService as unknown as { client: Rollbar | null }).client = null
}

describe('serializeError', () => {
  it('should keep the name, message and stack, which an Error does not enumerate', () => {
    const error = new TypeError('fetch failed')
    expect(serializeError(error)).toEqual({ name: 'TypeError', message: 'fetch failed', stack: error.stack })
  })

  it('should keep the code when there is one', () => {
    const error = Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' })
    expect(serializeError(error)).toMatchObject({ code: 'ECONNREFUSED' })
  })

  it('should serialize an Error cause as well', () => {
    const cause = new Error('socket hang up')
    expect(serializeError(new Error('fetch failed', { cause }))).toMatchObject({
      cause: { name: 'Error', message: 'socket hang up', stack: cause.stack },
    })
  })

  it('should keep a cause that is not an Error as it is', () => {
    expect(serializeError(new Error('rejected', { cause: { status: 503 } }))).toMatchObject({
      cause: { status: 503 },
    })
  })

  it('should stop following a cause chain that loops back on itself', () => {
    const error = new Error('outer') as Error & { cause?: unknown }
    error.cause = error
    expect(() => JSON.stringify(serializeError(error))).not.toThrow()
  })

  // ethers quotes the URL it called, and an Alchemy URL carries the key in its path.
  it('should redact keys from the message and the stack', () => {
    const error = new Error(`missing response (url="${RPC_URL}", code=SERVER_ERROR)`)
    expect(JSON.stringify(serializeError(error))).not.toContain(ALCHEMY_KEY)
    expect(serializeError(error).message).toContain('/v2/<redacted>')
  })

  it('should keep the details that tell failures apart, and leave out URLs and request bodies', () => {
    const error = Object.assign(new Error('Missing Access'), {
      status: 403,
      method: 'POST',
      waitSeconds: 30,
      url: 'https://discord.com/api/webhooks/123/webhook-token',
      requestBody: { content: 'hi' },
    })
    expect(serializeError(error)).toEqual(expect.objectContaining({ status: 403, method: 'POST', waitSeconds: 30 }))
    expect(serializeError(error)).not.toHaveProperty('url')
    expect(serializeError(error)).not.toHaveProperty('requestBody')
  })

  it('should redact a cause that is not an Error too', () => {
    const error = new Error('request failed', { cause: { url: RPC_URL, attempt: 2 } })
    expect(JSON.stringify(serializeError(error))).not.toContain(ALCHEMY_KEY)
  })

  // ethers values are often bigints, which JSON.stringify refuses.
  it('should turn bigints into strings, so the result can always be logged', () => {
    const error = Object.assign(new Error('gas estimation failed', { cause: { gas: BigInt(21000) } }), {
      code: BigInt(3),
    })
    expect(() => JSON.stringify(serializeError(error))).not.toThrow()
    expect(serializeError(error)).toMatchObject({ code: '3', cause: { gas: '21000' } })
  })

  it('should stop when an error is nested in its own cause', () => {
    const error = new Error('outer') as Error & { cause?: unknown }
    error.cause = { wrapped: error }
    expect(() => JSON.stringify(serializeError(error))).not.toThrow()
  })

  // undici's "fetch failed" is often caused by an AggregateError with an empty message.
  it('should keep the first few errors of an AggregateError', () => {
    const attempts = Array.from({ length: 8 }, (_, index) => new Error(`connect ECONNREFUSED 10.0.0.${index}:443`))
    const serialized = serializeError(new TypeError('fetch failed', { cause: new AggregateError(attempts, '') }))
    const cause = serialized.cause as { errors: { message: string }[] }
    expect(cause.errors).toHaveLength(5)
    expect(cause.errors[0]).toMatchObject({ message: 'connect ECONNREFUSED 10.0.0.0:443' })
  })
})

describe('toReportableError', () => {
  function chainOf(error: Error) {
    const chain: Error[] = []
    for (let current: unknown = error; current instanceof Error; current = (current as { cause?: unknown }).cause) {
      chain.push(current)
    }
    return chain
  }

  it('should keep the name, so Rollbar shows the right class', () => {
    expect(toReportableError(new TypeError('fetch failed')).name).toBe('TypeError')
  })

  it('should redact keys from the message and the stack', () => {
    const copy = toReportableError(new Error(`timeout (url="${RPC_URL}")`))
    expect(`${copy.message} ${copy.stack}`).not.toContain(ALCHEMY_KEY)
  })

  // rollbar walks the chain with no check of its own, so a loop would never end.
  it('should cut a cause chain that loops back on itself', () => {
    const first = new Error('first') as Error & { cause?: unknown }
    const second = new Error('second', { cause: first })
    first.cause = second
    expect(chainOf(toReportableError(first)).map(({ message }) => message)).toEqual(['first', 'second'])
  })

  it('should cut a very long chain', () => {
    let error = new Error('root')
    for (let index = 0; index < 20; index++) {
      error = new Error(`wrap ${index}`, { cause: error })
    }
    expect(chainOf(toReportableError(error))).toHaveLength(6)
  })

  // rollbar shows the first entry's message when the error's own is empty.
  it('should take the message of an aggregated entry that is a plain object', () => {
    const copy = toReportableError(new AggregateError([{ message: 'Validation failed' }], '')) as Error & {
      errors: { message: string }[]
    }
    expect(copy.errors).toEqual([{ message: 'Validation failed' }])
  })

  it('should follow `nested` the way rollbar does', () => {
    const error = Object.assign(new Error('outer'), { nested: new Error('inner') })
    expect(chainOf(toReportableError(error)).map(({ message }) => message)).toEqual(['outer', 'inner'])
  })
})

describe('shouldIgnoreItem', () => {
  it('should ignore a message item whose text mentions a filtered error', () => {
    expect(shouldIgnoreItem({ body: { message: { body: 'Unable to vote: ACTION_REJECTED' } } })).toBe(true)
  })

  it('should ignore a trace whose error message mentions a filtered error', () => {
    const item = { body: { trace_chain: [{ exception: { class: 'Error', message: 'FETCH_ERROR: timeout' } }] } }
    expect(shouldIgnoreItem(item)).toBe(true)
  })

  it('should ignore a trace reported with a message that mentions a filtered error', () => {
    const item = {
      body: { trace_chain: [{ exception: { message: 'boom', description: 'ACTION_REJECTED by the user' } }] },
    }
    expect(shouldIgnoreItem(item)).toBe(true)
  })

  // rollbar stops calling a checkIgnore that throws.
  it('should drop an item it cannot read rather than throw', () => {
    const item = {}
    Object.defineProperty(item, 'body', {
      get() {
        throw new Error('unreadable')
      },
    })
    expect(shouldIgnoreItem(item)).toBe(true)
  })

  it('should keep anything else', () => {
    expect(shouldIgnoreItem({ body: { message: { body: 'Unable to update project status' } } })).toBe(false)
    expect(shouldIgnoreItem({ body: { trace_chain: [{ exception: { message: 'fetch failed' } }] } })).toBe(false)
    expect(shouldIgnoreItem({})).toBe(false)
  })
})

describe('redactPayload', () => {
  it('should redact the text of a message item', () => {
    const payload = { body: { message: { body: `missing response (url="${RPC_URL}")` } } }
    redactPayload(payload)
    expect(JSON.stringify(payload)).not.toContain(ALCHEMY_KEY)
  })

  // rollbar copies the raw error in there itself.
  it('should redact the raw error rollbar adds to its diagnostics', () => {
    const payload = {
      body: {},
      notifier: { diagnostic: { raw_error: { message: RPC_URL, stack: `Error: ${RPC_URL}` } } },
    }
    redactPayload(payload)
    expect(JSON.stringify(payload)).not.toContain(ALCHEMY_KEY)
  })

  // An unhandled rejection whose reason is a plain object lands in custom, copied to the top, or in request.
  it('should redact what rollbar put in custom, its copies at the top, and request', () => {
    const payload = {
      body: {},
      custom: { reason: { url: RPC_URL } },
      reason: { url: RPC_URL },
      request: { url: RPC_URL, headers: { referer: RPC_URL } },
    }
    redactPayload(payload)
    expect(JSON.stringify(payload)).not.toContain(ALCHEMY_KEY)
  })

  // rollbar stops calling a callback that throws, so a failure has to be handled here.
  it('should replace a payload it cannot redact rather than send it as it is', () => {
    const payload: Record<string, unknown> = { custom: { url: RPC_URL } }
    Object.defineProperty(payload, 'body', {
      configurable: true,
      enumerable: true,
      get() {
        throw new Error('unreadable')
      },
    })
    expect(() => redactPayload(payload)).not.toThrow()
    expect(payload).not.toHaveProperty('custom')
    expect(JSON.stringify(payload.body)).toContain('could not be redacted')
  })

  it('should redact the message and description of every trace', () => {
    const payload = {
      body: {
        trace_chain: [{ exception: { message: RPC_URL, description: RPC_URL } }, { exception: { message: RPC_URL } }],
      },
    }
    redactPayload(payload)
    expect(JSON.stringify(payload)).not.toContain(ALCHEMY_KEY)
  })
})

describe('getRollbarConfig', () => {
  const config = getRollbarConfig('token', 'abc1234')

  it('should hold each process to 10 items a minute', () => {
    expect(config.itemsPerMinute).toBe(10)
  })

  // rollbar's server build drops it anyway, so setting it would only suggest a cap that does not exist.
  it('should not set a lifetime cap', () => {
    expect(config).not.toHaveProperty('maxItems')
  })

  it('should send the commit as the code version', () => {
    expect(config.codeVersion).toBe('abc1234')
    expect(getRollbarConfig('token', '').codeVersion).toBeUndefined()
  })
})

describe('ErrorService.report', () => {
  let rollbarError: jest.SpyInstance
  let loggerError: jest.SpyInstance

  beforeEach(() => {
    resetClient()
    rollbarError = jest.spyOn(Rollbar.prototype, 'error').mockImplementation(() => ({ uuid: 'uuid' }))
    loggerError = jest.spyOn(logger, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when the extra info carries an Error', () => {
    const error = new Error('Unable to fetch vesting data for empty contract address')

    beforeEach(() => {
      ErrorService.report('Unable to update project status', { error, id: 'project-1' })
    })

    it('should send the Error, titled and grouped by the message', () => {
      expect(rollbarError).toHaveBeenCalledWith(
        'Unable to update project status',
        expect.objectContaining({ name: 'Error', message: error.message, stack: error.stack }),
        {
          extraInfo: { error: serializeError(error), id: 'project-1' },
          title: 'Unable to update project status',
          fingerprint: getFingerprint('Unable to update project status'),
        }
      )
    })

    it('should send a copy rather than the Error itself', () => {
      expect(rollbarError.mock.calls[0][1]).not.toBe(error)
    })

    it('should log it serialized rather than as an empty object', () => {
      expect(loggerError).toHaveBeenCalledWith('Unable to update project status', {
        error: serializeError(error),
        id: 'project-1',
      })
    })
  })

  // Some callers pass the caught error where the message goes.
  describe('when it is given an Error instead of a message', () => {
    const error = new Error('Create spec failed')

    beforeEach(() => {
      ErrorService.report(error, { badgeTitle: 'Top Voter' })
    })

    it('should report a copy of the Error under its own message, keeping it serialized in the extra info', () => {
      expect(rollbarError).toHaveBeenCalledWith(
        'Create spec failed',
        expect.objectContaining({ name: 'Error', message: 'Create spec failed', stack: error.stack }),
        {
          extraInfo: { error: serializeError(error), badgeTitle: 'Top Voter' },
          title: 'Create spec failed',
          fingerprint: getFingerprint('Create spec failed'),
        }
      )
      expect(rollbarError.mock.calls[0][1]).not.toBe(error)
    })

    it('should log it with its stack', () => {
      expect(loggerError).toHaveBeenCalledWith('Create spec failed', {
        error: serializeError(error),
        badgeTitle: 'Top Voter',
      })
    })
  })

  describe('when there is nothing but a message', () => {
    it('should send it as it is', () => {
      ErrorService.report('Rollbar test')
      expect(rollbarError).toHaveBeenCalledWith('Rollbar test', { extraInfo: undefined })
    })
  })

  describe('when the extra info nests an Error or a URL with a key', () => {
    const error = new Error(`timeout (url="${RPC_URL}")`)

    beforeEach(() => {
      ErrorService.report('Error creating event', { event_data: { error, endpoints: [RPC_URL] } })
    })

    it('should serialize the Error and redact the key wherever they sit', () => {
      const { extraInfo } = rollbarError.mock.calls[0][1]
      expect(extraInfo.event_data.error).toEqual(serializeError(error))
      expect(JSON.stringify(extraInfo)).not.toContain(ALCHEMY_KEY)
    })
  })

  describe('when the extra info holds a bigint', () => {
    it('should log it as a string', () => {
      ErrorService.report('Error creating bid', { amount: BigInt(10) })
      expect(loggerError).toHaveBeenCalledWith('Error creating bid', { amount: '10' })
    })
  })

  // It is called from inside catch blocks, where a throw would replace the error being handled.
  describe('when logging fails', () => {
    it('should not throw', () => {
      loggerError.mockImplementation(() => {
        throw new TypeError('Converting circular structure to JSON')
      })
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      expect(() => ErrorService.report('Error creating event', { id: 1 })).not.toThrow()
    })
  })

  describe('when sending to Rollbar fails', () => {
    it('should not throw, and still log', () => {
      rollbarError.mockImplementation(() => {
        throw new Error('rollbar is broken')
      })
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      expect(() => ErrorService.report('Error creating event')).not.toThrow()
      expect(loggerError).toHaveBeenCalledWith('Error creating event', undefined)
    })
  })

  describe('when there is no Error to send', () => {
    it('should send a plain message, so Rollbar keeps grouping it by its text', () => {
      ErrorService.report('Could not find any budgets', { category: 'Budget' })
      expect(rollbarError).toHaveBeenCalledWith('Could not find any budgets', {
        extraInfo: { category: 'Budget' },
      })
    })
  })
})

describe('the Rollbar client', () => {
  let payloads: Payload[]

  async function sent(count = 1) {
    for (let attempt = 0; attempt < 200 && payloads.length < count; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5))
    }
    return payloads
  }

  beforeEach(() => {
    resetClient()
    payloads = []
    jest.spyOn(logger, 'error').mockImplementation(() => undefined)
    jest.spyOn(RollbarTransport.prototype, 'post').mockImplementation((...args: unknown[]) => {
      const [, , payload, callback] = args as [unknown, unknown, Payload, (err: unknown, resp: unknown) => void]
      payloads.push(payload)
      callback(null, { err: 0 })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when an Error is reported', () => {
    let payload: Payload['data']

    beforeEach(async () => {
      const cause = new Error('socket hang up')
      ErrorService.report('Unable to fetch vestings subgraph data', {
        error: new TypeError('fetch failed', { cause }),
        vestingAddress: '0x7a3abf8897f31b56f09c6f69d074a393a905c1ac',
      })
      payload = (await sent())[0].data
    })

    it('should send a stack trace, followed by its cause', () => {
      const chain = payload.body.trace_chain as { exception: { class: string; message: string }; frames: unknown[] }[]
      expect(chain.map(({ exception }) => exception.message)).toEqual(['fetch failed', 'socket hang up'])
      expect(chain[0].frames.length).toBeGreaterThan(0)
    })

    it('should title and fingerprint it by the reported message', () => {
      expect(payload.title).toBe('Unable to fetch vestings subgraph data')
      expect(payload.fingerprint).toBe(getFingerprint('Unable to fetch vestings subgraph data'))
    })

    it('should tag it with the commit it was built from', () => {
      expect(payload.code_version).toBe('abc1234')
    })

    it('should keep the serialized error in the custom data', () => {
      expect(payload.custom?.extraInfo).toMatchObject({
        error: { name: 'TypeError', message: 'fetch failed', stack: expect.stringContaining('fetch failed') },
      })
    })
  })

  describe('when an Error whose cause loops back on itself is reported', () => {
    it('should still send it, with the loop cut', async () => {
      const first = new Error('first') as Error & { cause?: unknown }
      first.cause = new Error('second', { cause: first })
      ErrorService.report('Error creating event', { error: first })
      const [payload] = await sent()
      expect((payload.data.body.trace_chain as unknown[]).length).toBe(2)
    })
  })

  describe('when an Error quotes a URL with a key in it', () => {
    it('should keep the key out of everything it sends', async () => {
      ErrorService.report('Unable to fetch vesting contract data from alchemy', {
        error: new Error(`missing response (url="${RPC_URL}")`),
        errorV1: `Error: timeout (url="${RPC_URL}")`,
      })
      const [payload] = await sent()
      expect(JSON.stringify(payload)).not.toContain(ALCHEMY_KEY)
    })
  })

  describe('when a message mentioning a filtered error is reported', () => {
    it('should not send it', async () => {
      ErrorService.report('Unable to vote: ACTION_REJECTED')
      ErrorService.report('Unable to update project status')
      const [payload, ...others] = await sent(2)
      expect(others).toHaveLength(0)
      expect(payload.data.body.message).toEqual({ body: 'Unable to update project status' })
    })
  })

  describe('when an unhandled rejection carries a plain object', () => {
    it('should keep a key in it out of what is sent', async () => {
      ErrorService.report('Unable to update project status')
      await sent()
      const client = (ErrorService as unknown as { getClient(): Rollbar }).getClient()
      client.error('Unhandled rejection', { reason: `timeout (url="${RPC_URL}")` })
      const [, payload] = await sent(2)
      expect(JSON.stringify(payload)).not.toContain(ALCHEMY_KEY)
    })
  })

  // rollbar's own handlers send these without going through report().
  describe('when an error reaches rollbar directly, as an uncaught one does', () => {
    it('should keep the key out of what it sends', async () => {
      ErrorService.report('Unable to update project status')
      await sent()
      const client = (ErrorService as unknown as { getClient(): Rollbar }).getClient()
      client.error(new Error(`missing response (url="${RPC_URL}")`))
      const [, payload] = await sent(2)
      expect(JSON.stringify(payload)).not.toContain(ALCHEMY_KEY)
    })
  })
})
