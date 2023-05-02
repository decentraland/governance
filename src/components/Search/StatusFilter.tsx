import React, { useMemo } from 'react'

import { useLocation } from '@reach/router'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEqual from 'lodash/isEqual'
import toSnakeCase from 'lodash/snakeCase'

import { GrantStatus } from '../../entities/Grant/types'
import { ProposalStatus } from '../../entities/Proposal/types'
import { getUrlFilters } from '../../helpers'

import { FilterProps } from './CategoryFilter'
import CollapsibleFilter from './CollapsibleFilter'
import FilterLabel from './FilterLabel'

type StatusType = typeof ProposalStatus | typeof GrantStatus

const FILTER_KEY = 'status'

export default React.memo(function StatusFilter({
  onChange,
  startOpen,
  statusType,
}: FilterProps & { statusType: StatusType }) {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const status = params.get(FILTER_KEY)
  const isGrantFilter = isEqual(statusType, GrantStatus)

  return (
    <CollapsibleFilter title={t('navigation.search.status_filter_title')} startOpen={startOpen} onChange={onChange}>
      <FilterLabel label={t(`status.all`)} href={getUrlFilters(FILTER_KEY, params)} active={!status} />
      {Object.values(statusType).map((value, index) => {
        const label = toSnakeCase(value)
        if (![ProposalStatus.Deleted, ProposalStatus.Pending].includes(value)) {
          return (
            <FilterLabel
              key={'status_filter' + index}
              label={t(`${isGrantFilter ? 'grant_' : ''}status.${label}`)}
              href={getUrlFilters(FILTER_KEY, params, label)}
              active={status === label}
            />
          )
        }
      })}
    </CollapsibleFilter>
  )
})
