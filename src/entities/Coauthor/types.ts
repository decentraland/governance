export enum CoauthorStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export type CoauthorAttributes = {
  proposal_id: string
  coauthor_address: string
  status: CoauthorStatus
}
