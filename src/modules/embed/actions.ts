import { action } from 'typesafe-actions'
import { Embed } from './types'

export const LOAD_EMBED_REQUEST = '[Request] Load embed'
export const LOAD_EMBED_SUCCESS = '[Success] Load embed'
export const LOAD_EMBED_FAILURE = '[Failure] Load embed'

export const loadEmbedRequest = (proposals: string[]) => action(LOAD_EMBED_REQUEST, { proposals })
export const loadEmbedSuccess = (embeds: Record<string, Embed[]>) => action(LOAD_EMBED_SUCCESS, embeds)
export const loadEmbedFailure = (error: Record<string, string>) => action(LOAD_EMBED_FAILURE, error)

export type LoadEmbedRequestAction = ReturnType<typeof loadEmbedRequest>
export type LoadEmbedSuccessAction = ReturnType<typeof loadEmbedSuccess>
export type LoadEmbedFailureAction = ReturnType<typeof loadEmbedFailure>
