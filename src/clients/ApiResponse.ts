export type ApiResponse<D> = { ok: boolean; data: D }
export type ApiError<D = undefined> = { ok: boolean; error: string; data: D }
export type ApiValidationError = {
  ok: boolean
  error: string
  data: { errors: string[] }
}
