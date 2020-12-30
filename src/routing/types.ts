export type NewProposalParams = {
  modal?: 'new',
  create?: 'poi' | 'question' | 'catalyst' | 'ban' | 'grant',
  position?: string,
  question?: string,
  catalystOwner?: string,
  catalystUrl?: string,
  banName?: string,
  completed?: boolean
  grantUrl?: string,
  grantAmount?: number,
  grantDestination?: string,
}

export type FilterProposalParams = {
  status?: string
  category?: string
}

export type CastParams = {
  modal?: 'vote',
  support?: boolean,
  completed?: boolean
}

export type UnwrapParams = {
  modal?: 'unwrap',
  amount?: number | string,
  completed?: boolean
}
