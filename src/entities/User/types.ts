export type UserAttributes = {
  address: string
  forum_id: number
  forum_verification_date: string
}

export type ValidationMessage = {
  address: string
  timestamp: string
  message_timeout: NodeJS.Timeout
}

export type ValidatedAccount = {
  address: string
  forum_id: number
}

export type ValidationComment = {
  id: number
  content: string
  timestamp: string
}
