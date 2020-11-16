export type NewProposalParams = {
  modal?: 'new',
  create?: 'poi' | 'question' | 'catalyst' | 'ban',
  position?: string,
  question?: string,
  catalystOwner?: string,
  catalystUrl?: string,
  banName?: string,
  completed?: boolean
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
