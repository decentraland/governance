import { createHash } from 'crypto'
import Rollbar from 'rollbar'

import { isProdEnv } from '../utils/governanceEnvs'
import logger from '../utils/logger'
import { redactSecrets } from '../utils/redactSecrets'

const FILTERED_ERRORS = ['FETCH_ERROR', 'ACTION_REJECTED']

// Per process, and the only limit in effect: rollbar's server build drops any `maxItems` setting.
const ITEMS_PER_MINUTE = 10

// Enough for errors wrapped a few times over. A cause chain that loops back on itself is cut here too.
const MAX_CAUSE_DEPTH = 5

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

function redactValue(value: unknown) {
  return typeof value === 'string' ? redactSecrets(value) : value
}

function serializeLinked(value: unknown, depth: number): unknown {
  if (!(value instanceof Error)) {
    return redactValue(value)
  }
  return depth < MAX_CAUSE_DEPTH ? serializeError(value, depth + 1) : `${value.name}: ${redactSecrets(value.message)}`
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
      serialized[detail] = redactValue(value)
    }
  }
  if (cause !== undefined) {
    serialized.cause = serializeLinked(cause, depth)
  }
  if (Array.isArray(errors) && errors.length > 0) {
    serialized.errors = errors.slice(0, MAX_AGGREGATED_ERRORS).map((inner) => serializeLinked(inner, depth))
  }
  return serialized
}

/**
 * The copy of an error that rollbar parses, with keys redacted from its message and stack. rollbar follows
 * `nested || cause` with no limit or check, so a chain that loops back on itself would never end: the copy stops
 * at MAX_CAUSE_DEPTH and at the first error it has already seen.
 */
export function toReportableError(error: Error, depth = 0, seen = new Set<unknown>()): Error {
  seen.add(error)
  const copy = new Error(redactSecrets(String(error.message ?? ''))) as Error & LinkedErrors
  copy.name = error.name
  copy.stack = error.stack ? redactSecrets(error.stack) : `${copy.name}: ${copy.message}`
  const { cause, nested, errors } = error as Error & LinkedErrors
  const next = nested || cause
  if (next instanceof Error && depth < MAX_CAUSE_DEPTH && !seen.has(next)) {
    copy.cause = toReportableError(next, depth + 1, seen)
  }
  // rollbar takes the first one's message when the error's own is empty, as undici's AggregateError's is.
  if (Array.isArray(errors) && errors.length > 0) {
    copy.errors = errors
      .slice(0, MAX_AGGREGATED_ERRORS)
      .map((inner) => ({ message: redactSecrets(inner instanceof Error ? inner.message : String(inner)) }))
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
  return Object.fromEntries(
    entries.map(([key, value]) => [key, value instanceof Error ? serializeError(value) : redactValue(value)])
  )
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

export function shouldIgnoreItem(item: Rollbar.Dictionary): boolean {
  return getItemTexts(item).some((text) => FILTERED_ERRORS.some((filtered) => text.includes(filtered)))
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
      this.client = new Rollbar({
        accessToken: DAO_ROLLBAR_TOKEN,
        captureUncaught: true,
        captureUnhandledRejections: true,
        environment: 'production',
        codeVersion: COMMIT_HASH || undefined,
        itemsPerMinute: ITEMS_PER_MINUTE,
        captureIp: 'anonymize',
        ignoreDuplicateErrors: true,
        checkIgnore: (_isUncaught: boolean, _args: Rollbar.LogArgument[], item: Rollbar.Dictionary) =>
          shouldIgnoreItem(item),
      })
    }
    return this.client
  }

  public static report(errorOrMessage: string | Error, extraInfo?: Record<string, unknown>) {
    const message = toMessage(errorOrMessage)
    const serializedExtraInfo = serializeExtraInfo(errorOrMessage, extraInfo)
    if (isProdEnv()) {
      if (require('../constants').DAO_ROLLBAR_TOKEN) {
        const error = findError(errorOrMessage, extraInfo)
        if (error) {
          // Sent as an Error so Rollbar gets the stack trace and the cause chain. rollbar copies the title and
          // fingerprint from the custom data to the top of the payload.
          this.getClient().error(message, toReportableError(error), {
            extraInfo: serializedExtraInfo,
            title: message,
            fingerprint: getFingerprint(message),
          })
        } else {
          this.getClient().error(message, { extraInfo: serializedExtraInfo })
        }
      } else {
        logger.error('Rollbar server access token not found')
      }
    }
    logger.error(message, serializedExtraInfo)
  }
}
