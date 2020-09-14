import { createSelector } from 'reselect'
import { getLocation } from 'connected-react-router'
import { Location } from 'history'
import { CastParams, NewProposalParams, FilterProposalParams, UnwrapParams } from './types'
import { formatParams, getBooleanParam, getEnumParam, getNumberParam, getStringParam } from './utils'
import { VoteStatus } from 'modules/vote/types'

export const getParams = createSelector(
  getLocation as any,
  (location: Location<any>) => location.search
)

export const getQuery = createSelector(
  getParams,
  (params) => Object.fromEntries(new URLSearchParams(params).entries())
)

export const getNewProposalParams = createSelector(
  getQuery,
  (query) => formatParams({
    modal: getEnumParam(query.modal, [ 'new' ]),
    create: getEnumParam(query.create, [ 'poi', 'question', 'catalyst', 'ban' ]),
    position: getStringParam(query.position),
    question: getStringParam(query.question),
    catalystOwner: getStringParam(query.catalystOwner),
    catalystUrl: getStringParam(query.catalystUrl),
    banName: getStringParam(query.banName),
    completed: getBooleanParam(query.completed)
  }) as NewProposalParams
)

export const getFilterProposalParams = createSelector(
  getQuery,
  (query) => formatParams({
    status: getEnumParam(query.status, [ VoteStatus.Enacted, VoteStatus.Passed, VoteStatus.Progress, VoteStatus.Rejected ])
  }) as FilterProposalParams
)

export const getCastParams = createSelector(
  getQuery,
  (query) => formatParams({
    modal: getEnumParam(query.modal, [ 'vote' ]),
    support: getBooleanParam(query.support),
    completed: getBooleanParam(query.completed)
  }) as CastParams
)

export const getUnwrapParams = createSelector(
  getQuery,
  (query) => formatParams({
    modal: getEnumParam(query.modal, [ 'unwrap' ]),
    amount: getNumberParam(query.amount),
    completed: getBooleanParam(query.completed)
  }) as UnwrapParams
)
