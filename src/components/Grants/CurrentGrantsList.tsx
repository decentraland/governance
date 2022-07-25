import React, { useCallback, useEffect, useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { filter, isEmpty, orderBy } from 'lodash'

import { GrantWithUpdateAttributes, PROPOSAL_GRANT_CATEGORY_ALL } from '../../entities/Proposal/types'
import { useCurrentGrantsFilteredByCategory } from '../../hooks/useCurrentsGrantsFilteredByCategory'
import FullWidthButton from '../Common/FullWidthButton'

import GrantCard from './GrantCard/GrantCard'

import CurrentGrantsBanner from './CurrentGrantsBanner'
import CurrentGrantsCategoryFilters, { GrantCategoryFilter } from './CurrentGrantsCategoryFilters'
import './CurrentGrantsList.css'
import CurrentGrantsSortingMenu from './CurrentGrantsSortingMenu'

const CURRENT_GRANTS_PER_PAGE = 8

const CurrentGrantsList = ({ grants }: { grants: GrantWithUpdateAttributes[] }) => {
  const t = useFormatMessage()
  const [selectedCategory, setSelectedCategory] = useState<GrantCategoryFilter>(PROPOSAL_GRANT_CATEGORY_ALL)
  const [sortingKey, setSortingKey] = useState('created_at')
  const sortedCurrentGrants = useMemo(() => orderBy(grants, [sortingKey], ['desc']), [grants, sortingKey])
  const [filteredCurrentGrants, setFilteredCurrentGrants] = useState<GrantWithUpdateAttributes[]>([])
  const currentGrantsFilteredByCategory = useCurrentGrantsFilteredByCategory(sortedCurrentGrants)

  useEffect(() => {
    if (!isEmpty(grants)) {
      setFilteredCurrentGrants(sortedCurrentGrants.slice(0, CURRENT_GRANTS_PER_PAGE))
    }
  }, [grants, sortedCurrentGrants])

  useEffect(() => {
    if (!isEmpty(sortedCurrentGrants) && selectedCategory) {
      const newGrants =
        selectedCategory === PROPOSAL_GRANT_CATEGORY_ALL
          ? sortedCurrentGrants.slice(0, CURRENT_GRANTS_PER_PAGE)
          : filter(sortedCurrentGrants, (item) => item.configuration.category === selectedCategory).slice(
              0,
              CURRENT_GRANTS_PER_PAGE
            )
      setFilteredCurrentGrants(newGrants)
    }
  }, [sortedCurrentGrants, selectedCategory])

  const handleLoadMoreCurrentGrantsClick = useCallback(() => {
    if (grants) {
      const newCurrentGrants = currentGrantsFilteredByCategory[selectedCategory].slice(
        0,
        filteredCurrentGrants.length + CURRENT_GRANTS_PER_PAGE
      )
      setFilteredCurrentGrants(newCurrentGrants)
    }
  }, [grants, currentGrantsFilteredByCategory, selectedCategory, filteredCurrentGrants])

  const showLoadMoreCurrentGrantsButton =
    filteredCurrentGrants?.length !== currentGrantsFilteredByCategory[selectedCategory]?.length

  return (
    <>
      <CurrentGrantsBanner grants={grants} />
      <div>
        <h2 className="CurrentGrants__Title">{t('page.grants.currently_funded')}</h2>
        <div className="CurrentGrants__Filters">
          <CurrentGrantsCategoryFilters
            currentGrantsFilteredByCategory={currentGrantsFilteredByCategory}
            onSelectedCategoryChange={setSelectedCategory}
          />
          <CurrentGrantsSortingMenu onSortingKeyChange={setSortingKey} />
        </div>
        <Container className="CurrentGrants__Container">
          {filteredCurrentGrants?.map((grant) => (
            <GrantCard key={`CurrentGrantCard_${grant.id}`} grant={grant} />
          ))}
        </Container>
      </div>
      {showLoadMoreCurrentGrantsButton && (
        <FullWidthButton onClick={handleLoadMoreCurrentGrantsClick} label={t('page.grants.load_more_button')} />
      )}
    </>
  )
}

export default CurrentGrantsList
