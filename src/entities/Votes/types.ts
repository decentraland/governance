export type VoteAttributes = {
  proposal_id: string,
  hash: string,
  votes: any,
  created_at: Date,
  updated_at: Date,
}

export type Vote = {
  choice: number,
  vp: number
}

export type ChoiceColor = "approve" | "reject" | number