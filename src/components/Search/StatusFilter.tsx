import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ProposalStatus, toProposalStatus } from '../../entities/Proposal/types'
import locations from '../../modules/locations'

import { FilterProps } from './CategoryFilter'
import CollapsibleFilter from './CollapsibleFilter'
import FilterLabel from './FilterLabel'

export default React.memo(function StatusFilter({ onChange }: FilterProps) {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const status = toProposalStatus(params.get('status')) ?? undefined

  function handleStatusFilter(status: ProposalStatus | null) {
    const newParams = new URLSearchParams(params)
    status ? newParams.set('status', status) : newParams.delete('status')
    newParams.delete('page')
    return locations.proposals(newParams)
  }

  return (
    <CollapsibleFilter title={t('navigation.search.status_filter_title') || ''} startOpen={false} onChange={onChange}>
      <FilterLabel label={t(`status.all`) || ''} href={handleStatusFilter(null)} active={!status} />
      {(Object.keys(ProposalStatus) as Array<keyof typeof ProposalStatus>).map((key, index) => {
        const proposalStatus = ProposalStatus[key]
        if (![ProposalStatus.Deleted, ProposalStatus.Pending].includes(proposalStatus)) {
          return (
            <FilterLabel
              key={'status_filter' + index}
              label={t(`status.${proposalStatus}`) || ''}
              href={handleStatusFilter(proposalStatus)}
              active={status === proposalStatus}
            />
          )
        }
      })}
    </CollapsibleFilter>
  )
})
