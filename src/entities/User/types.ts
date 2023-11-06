type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>

export type UserAttributes = {
  address: string
  forum_id?: number
  forum_verification_date?: string
  discord_id?: string
  discord_verification_date?: string
}

export type ValidationMessage = {
  address: string
  timestamp: string
  message_timeout: NodeJS.Timeout
}

export type ValidatedAccount = Required<Pick<UserAttributes, 'address' | 'forum_id' | 'discord_id'>>

export type ValidatedForumAccount = Optional<ValidatedAccount, 'discord_id'>

export type ValidatedDiscordAccount = Optional<ValidatedAccount, 'forum_id'>

export type ValidationComment = {
  id: string
  content: string
  timestamp: number
}

export enum AccountType {
  Forum = 'forum',
  Discord = 'discord',
  Twitter = 'twitter',
}
