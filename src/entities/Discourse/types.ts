export type DiscourseAttributes = {
  address: string
  forum_id: number
  verification_date: string
}

export type ValidationMessage = {
  address: string
  timestamp: string
  messageTimeout: NodeJS.Timeout
}
