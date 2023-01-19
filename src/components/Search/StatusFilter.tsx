import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEqual from 'lodash/isEqual'
import toSnakeCase from 'lodash/snakeCase'

import { GrantStatus } from '../../entities/Grant/types'
import { ProposalStatus } from '../../entities/Proposal/types'

import { FilterProps } from './CategoryFilter'
import CollapsibleFilter from './CollapsibleFilter'
import FilterLabel from './FilterLabel'

type StatusType = typeof ProposalStatus | typeof GrantStatus

export default React.memo(function StatusFilter({
  onChange,
  startOpen,
  statusType,
}: FilterProps & { statusType: StatusType }) {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const status = params.get('status')

  function handleStatusFilter(status: string | null) {
    const newParams = new URLSearchParams(params)
    status ? newParams.set('status', status) : newParams.delete('status')
    newParams.delete('page')
    const stringParams = newParams.toString()
    return `${location.pathname}${stringParams === '' ? '' : '?' + stringParams}`
  }

  return (
    <CollapsibleFilter title={t('navigation.search.status_filter_title')} startOpen={startOpen} onChange={onChange}>
      <FilterLabel label={t(`status.all`)} href={handleStatusFilter(null)} active={!status} />
      {Object.values(statusType).map((value, index) => {
        const label = toSnakeCase(value)
        if (![ProposalStatus.Deleted, ProposalStatus.Pending].includes(value)) {
          return (
            <FilterLabel
              key={'status_filter' + index}
              label={t(`${isEqual(statusType, GrantStatus) ? 'grant_' : ''}status.${label}`)}
              href={handleStatusFilter(label)}
              active={status === label}
            />
          )
        }
      })}
    </CollapsibleFilter>
  )
})
