import { createSelector } from 'reselect'
import { getLocation } from 'connected-react-router'
import { Location } from 'history'

export const getParams = createSelector(
  getLocation as any,
  (location: Location<any>) => location.search
)

export const getQuery = createSelector(
  getParams,
  (params) => Object.fromEntries(new URLSearchParams(params).entries())
)
