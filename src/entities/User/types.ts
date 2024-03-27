type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>

export type UserAttributes = {
  address: string
  forum_id?: number
  forum_verification_date?: string
  discord_id?: string
  discord_verification_date?: string
  is_discord_notifications_active?: boolean
}

export type ValidationMessage = {
  address: string
  timestamp: string
  message_timeout: NodeJS.Timeout
}

export type ValidatedAccount = Required<Pick<UserAttributes, 'address' | 'forum_id' | 'discord_id'>>

export type ValidatedForumAccount = Optional<ValidatedAccount, 'discord_id'>

export type ValidatedDiscordAccount = Optional<ValidatedAccount, 'forum_id'> &
  Pick<UserAttributes, 'is_discord_notifications_active'>

export type ValidationComment = {
  id: string
  userId: string
  content: string
  timestamp: number
}

export enum AccountType {
  Forum = 'forum',
  Discord = 'discord',
  Push = 'push',
}
