export type NewProposalParams = {
  modal?: 'new',
  create?: 'poi' | 'question' | 'catalyst' | 'ban',
  position?: string,
  question?: string,
  catalystOwner?: string,
  catalystUrl?: string,
  banName?: string,
  completed?: true
}

export type UnwrapParams = {
  modal?: 'unwrap',
  amount?: string,
  completed?: true
}
