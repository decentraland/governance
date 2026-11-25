import { createHash } from 'crypto'
import Rollbar from 'rollbar'

import { isProdEnv } from '../utils/governanceEnvs'
import logger from '../utils/logger'
import { redactSecrets } from '../utils/redactSecrets'

const FILTERED_ERRORS = ['FETCH_ERROR', 'ACTION_REJECTED']

// Per process, and the only limit in effect: rollbar's server build drops any `maxItems` setting.
const ITEMS_PER_MINUTE = 10

// How deep serialization goes, through causes and nested extra info alike: enough for an error wrapped a few
// times over. One budget for both is what also stops anything cyclic, even an error nested in its own cause.
const MAX_DEPTH = 5

// The payload rollbar sends wraps the extra info a few levels down, so its redaction goes a little deeper.
const MAX_PAYLOAD_DEPTH = 10

// An AggregateError, like the cause of undici's "fetch failed", holds one error per address it tried.
const MAX_AGGREGATED_ERRORS = 5

// Kept besides the name, message and stack: what tells one failure from another. Nothing that carries a URL,
// headers or a request body, since a Discord error's url can hold a webhook token.
const ERROR_DETAILS = ['code', 'errno', 'syscall', 'status', 'statusCode', 'method', 'waitSeconds'] as const

export type SerializedError = {
  name: string
  message: string
  stack?: string
  cause?: unknown
  errors?: unknown[]
} & Partial<Record<typeof ERROR_DETAILS[number], unknown>>

type LinkedErrors = { cause?: unknown; nested?: unknown; errors?: unknown }

type TraceLike = { exception?: { message?: unknown; description?: unknown } }
type PayloadBody = { message?: { body?: unknown }; trace?: TraceLike; trace_chain?: TraceLike[] }
type PayloadNotifier = { diagnostic?: { raw_error?: { message?: unknown; stack?: unknown } } }

function messageOf(value: unknown): string {
  if (value instanceof Error) {
    return value.message
  }
  const message = (value as { message?: unknown } | null)?.message
  return typeof message === 'string' ? message : String(value)
}

/**
 * Makes a value safe to send and to log: Errors serialized, strings redacted, bigints (common in ethers values)
 * turned into strings, and anything past MAX_DEPTH cut, so the JSON logger can never throw on it.
 */
function serializeValue(value: unknown, depth = 0): unknown {
  if (typeof value === 'string') {
    return redactSecrets(value)
  }
  if (typeof value === 'bigint') {
    return value.toString()
  }
  if (value === null || typeof value !== 'object') {
    return value
  }
  if (depth >= MAX_DEPTH) {
    return value instanceof Error ? `${value.name}: ${redactSecrets(value.message)}` : '[Truncated]'
  }
  if (value instanceof Error) {
    return serializeError(value, depth)
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item, depth + 1))
  }
  // Dates and the like know how to serialize themselves.
  if (typeof (value as { toJSON?: unknown }).toJSON === 'function') {
    return value
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeValue(item, depth + 1)]))
}

/**
 * An Error's own properties are not enumerable, so it reaches Rollbar's custom data, and the JSON logs, as `{}`.
 * Errors quote the URLs they called, so keys are redacted.
 */
export function serializeError(error: Error, depth = 0): SerializedError {
  const { cause, errors } = error as Error & LinkedErrors
  const serialized: SerializedError = { name: error.name, message: redactSecrets(String(error.message ?? '')) }
  if (error.stack) {
    serialized.stack = redactSecrets(error.stack)
  }
  for (const detail of ERROR_DETAILS) {
    const value = (error as unknown as Record<string, unknown>)[detail]
    if (value !== undefined) {
      serialized[detail] = serializeValue(value, depth + 1)
    }
  }
  if (cause !== undefined) {
    serialized.cause = serializeValue(cause, depth + 1)
  }
  if (Array.isArray(errors) && errors.length > 0) {
    serialized.errors = errors.slice(0, MAX_AGGREGATED_ERRORS).map((inner) => serializeValue(inner, depth + 1))
  }
  return serialized
}

/**
 * The copy of an error that rollbar parses, with keys redacted from its message and stack. rollbar follows
 * `nested || cause` with no limit or check, so a chain that loops back on itself would never end: the copy stops
 * at MAX_DEPTH and at the first error it has already seen.
 */
export function toReportableError(error: Error, depth = 0, seen = new Set<unknown>()): Error {
  seen.add(error)
  const copy = new Error(redactSecrets(String(error.message ?? ''))) as Error & LinkedErrors
  copy.name = error.name
  copy.stack = error.stack ? redactSecrets(error.stack) : `${copy.name}: ${copy.message}`
  const { cause, nested, errors } = error as Error & LinkedErrors
  const next = nested || cause
  if (next instanceof Error && depth < MAX_DEPTH && !seen.has(next)) {
    copy.cause = toReportableError(next, depth + 1, seen)
  }
  // rollbar takes the first one's message when the error's own is empty, as undici's AggregateError's is.
  if (Array.isArray(errors) && errors.length > 0) {
    copy.errors = errors.slice(0, MAX_AGGREGATED_ERRORS).map((inner) => ({ message: redactSecrets(messageOf(inner)) }))
  }
  return copy
}

// An Error passed in place of the message is kept as `error`, unless the extra info already has one.
function serializeExtraInfo(errorOrMessage: unknown, extraInfo?: Record<string, unknown>) {
  const entries = Object.entries(extraInfo || {})
  if (errorOrMessage instanceof Error && !extraInfo?.error) {
    entries.unshift(['error', errorOrMessage])
  }
  if (entries.length === 0) {
    return extraInfo
  }
  return Object.fromEntries(entries.map(([key, value]) => [key, serializeValue(value)]))
}

// Some callers hand over a caught error where a message is expected, despite the type.
function toMessage(errorOrMessage: unknown): string {
  if (typeof errorOrMessage === 'string') {
    return redactSecrets(errorOrMessage)
  }
  if (errorOrMessage instanceof Error) {
    return redactSecrets(errorOrMessage.message || errorOrMessage.name)
  }
  return redactSecrets(String(errorOrMessage))
}

function findError(errorOrMessage: unknown, extraInfo?: Record<string, unknown>): Error | undefined {
  if (errorOrMessage instanceof Error) {
    return errorOrMessage
  }
  if (extraInfo?.error instanceof Error) {
    return extraInfo.error
  }
  return Object.values(extraInfo || {}).find((value): value is Error => value instanceof Error)
}

// A message item carries its text in body.message.body, never in body.message itself. A trace carries the
// error's own message and, as its description, the message it was reported with.
function getItemTexts(item: Rollbar.Dictionary): string[] {
  const body = item.body as PayloadBody | undefined
  if (!body) {
    return []
  }
  const traces = [...(body.trace_chain || []), ...(body.trace ? [body.trace] : [])]
  return [
    body.message?.body,
    ...traces.flatMap((trace) => [trace?.exception?.message, trace?.exception?.description]),
  ].filter((text): text is string => typeof text === 'string')
}

// Payloads redactPayload could neither redact nor replace. checkIgnore runs right after it, on the same object.
const unredactablePayloads = new WeakSet<object>()

// rollbar stops calling a checkIgnore that throws, so this never throws: what it cannot read, it drops.
export function shouldIgnoreItem(item: Rollbar.Dictionary): boolean {
  try {
    if (unredactablePayloads.has(item)) {
      return true
    }
    return getItemTexts(item).some((text) => FILTERED_ERRORS.some((filtered) => text.includes(filtered)))
  } catch {
    return true
  }
}

function redactFields<T extends Record<string, unknown>>(target: T | undefined, fields: (keyof T)[]) {
  for (const field of fields) {
    const value = target?.[field]
    if (target && typeof value === 'string') {
      target[field] = redactSecrets(value) as T[keyof T]
    }
  }
}

function redactDeep(value: unknown, depth = 0): unknown {
  if (typeof value === 'string') {
    return redactSecrets(value)
  }
  if (value === null || typeof value !== 'object') {
    return value
  }
  if (depth >= MAX_PAYLOAD_DEPTH) {
    return '[Truncated]'
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactDeep(item, depth + 1))
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactDeep(item, depth + 1)]))
}

/**
 * Runs on every payload just before it is sent, including what rollbar captures by itself (uncaught exceptions
 * and unhandled rejections), which never goes through report(). It has to be this late: rollbar copies the raw
 * error's message and stack into notifier.diagnostic after its `transform` hook has run.
 */
export function redactPayload(payload: Rollbar.Dictionary) {
  try {
    const body = payload.body as PayloadBody | undefined
    redactFields(body?.message, ['body'])
    for (const trace of [...(body?.trace_chain || []), ...(body?.trace ? [body.trace] : [])]) {
      redactFields(trace?.exception, ['message', 'description'])
    }
    redactFields((payload.notifier as PayloadNotifier | undefined)?.diagnostic?.raw_error, ['message', 'stack'])
    // A rejection reason that is a plain object goes into custom, which rollbar also copies to the top of the
    // payload, or into request when it has request-like keys.
    const custom = payload.custom as Record<string, unknown> | undefined
    for (const key of Object.keys(custom || {})) {
      if (key in payload) {
        payload[key] = redactDeep(payload[key])
      }
    }
    if (custom) {
      payload.custom = redactDeep(custom)
    }
    if (payload.request) {
      payload.request = redactDeep(payload.request)
    }
  } catch (error) {
    // rollbar stops calling a callback that throws, so this must not throw. What could not be redacted is not sent:
    // it is replaced, or if even that fails, dropped by checkIgnore.
    try {
      Object.defineProperty(payload, 'body', {
        value: { message: { body: `An error report was replaced because it could not be redacted: ${error}` } },
        writable: true,
        enumerable: true,
        configurable: true,
      })
      delete payload.custom
      delete payload.request
      delete (payload.notifier as PayloadNotifier | undefined)?.diagnostic?.raw_error
    } catch {
      unredactablePayloads.add(payload)
    }
  }
}

export function getRollbarConfig(accessToken: string, codeVersion?: string): Rollbar.Configuration {
  return {
    accessToken,
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: 'production',
    codeVersion: codeVersion || undefined,
    itemsPerMinute: ITEMS_PER_MINUTE,
    captureIp: 'anonymize',
    ignoreDuplicateErrors: true,
    checkIgnore: (_isUncaught: boolean, _args: Rollbar.LogArgument[], item: Rollbar.Dictionary) =>
      shouldIgnoreItem(item),
    onSendCallback: (_isUncaught: boolean, _args: Rollbar.LogArgument[], payload: Rollbar.Dictionary) =>
      redactPayload(payload),
  }
}

/**
 * Rollbar groups an item with a stack trace by its frames. Errors thrown by async library code, like
 * "fetch failed", carry only the library's frames, so every caller would land in one item. Grouping by the
 * reported message keeps one item per report, as before. Rollbar fingerprints a message item by the SHA1 of its
 * text, so a message with nothing data-like in it gets the same fingerprint either way.
 */
export function getFingerprint(message: string): string {
  return createHash('sha1').update(message).digest('hex')
}

export class ErrorService {
  private static client: Rollbar | null

  private static getClient() {
    if (!this.client) {
      const { DAO_ROLLBAR_TOKEN, COMMIT_HASH } = require('../constants')
      this.client = new Rollbar(getRollbarConfig(DAO_ROLLBAR_TOKEN, COMMIT_HASH))
    }
    return this.client
  }

  // Reports are made from inside callers' catch blocks, so reporting must never throw itself.
  public static report(errorOrMessage: string | Error, extraInfo?: Record<string, unknown>) {
    const message = toMessage(errorOrMessage)
    const serializedExtraInfo = serializeExtraInfo(errorOrMessage, extraInfo)
    if (isProdEnv()) {
      try {
        this.sendToRollbar(message, findError(errorOrMessage, extraInfo), serializedExtraInfo)
      } catch (error) {
        console.error('Unable to report to Rollbar', `${error}`)
      }
    }
    try {
      logger.error(message, serializedExtraInfo)
    } catch (error) {
      console.error(message, `(could not log its details: ${error})`)
    }
  }

  private static sendToRollbar(message: string, error: Error | undefined, extraInfo?: Record<string, unknown>) {
    if (!require('../constants').DAO_ROLLBAR_TOKEN) {
      logger.error('Rollbar server access token not found')
      return
    }
    if (error) {
      // Sent as an Error so Rollbar gets the stack trace and the cause chain. rollbar copies the title and
      // fingerprint from the custom data to the top of the payload.
      this.getClient().error(message, toReportableError(error), {
        extraInfo,
        title: message,
        fingerprint: getFingerprint(message),
      })
    } else {
      this.getClient().error(message, { extraInfo })
    }
  }
}
