import { createHash } from 'crypto'
import Rollbar from 'rollbar'

import { isProdEnv } from '../utils/governanceEnvs'
import logger from '../utils/logger'

const FILTERED_ERRORS = ['FETCH_ERROR', 'ACTION_REJECTED']

// Per process, and the only limit in effect: rollbar's server build drops any `maxItems` setting.
const ITEMS_PER_MINUTE = 10

// Enough for errors wrapped a few times over, and a stop for a cause chain that loops back on itself.
const MAX_CAUSE_DEPTH = 5

export type SerializedError = {
  name: string
  message: string
  stack?: string
  code?: unknown
  cause?: unknown
}

type ErrorDetails = { code?: unknown; cause?: unknown }

type TraceLike = { exception?: { message?: unknown; description?: unknown } }
type PayloadBody = { message?: { body?: unknown }; trace?: TraceLike; trace_chain?: TraceLike[] }

/**
 * An Error's own properties are not enumerable, so it reaches Rollbar's custom data, and the JSON logs, as `{}`.
 */
export function serializeError(error: Error, depth = 0): SerializedError {
  const { code, cause } = error as Error & ErrorDetails
  const serialized: SerializedError = { name: error.name, message: error.message }
  if (error.stack) {
    serialized.stack = error.stack
  }
  if (code !== undefined) {
    serialized.code = code
  }
  if (cause !== undefined) {
    if (!(cause instanceof Error)) {
      serialized.cause = cause
    } else {
      serialized.cause = depth < MAX_CAUSE_DEPTH ? serializeError(cause, depth + 1) : `${cause.name}: ${cause.message}`
    }
  }
  return serialized
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
    entries.map(([key, value]) => [key, value instanceof Error ? serializeError(value) : value])
  )
}

// Some callers hand over a caught error where a message is expected, despite the type.
function toMessage(errorOrMessage: unknown): string {
  if (typeof errorOrMessage === 'string') {
    return errorOrMessage
  }
  if (errorOrMessage instanceof Error) {
    return errorOrMessage.message || errorOrMessage.name
  }
  return String(errorOrMessage)
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
          this.getClient().error(message, error, {
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
