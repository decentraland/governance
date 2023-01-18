import React, { useCallback, useEffect, useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import orderBy from 'lodash/orderBy'

import { GrantWithUpdateAttributes, PROPOSAL_GRANT_CATEGORY_ALL } from '../../../entities/Proposal/types'
import { useCurrentGrantsFilteredByCategory } from '../../../hooks/useCurrentsGrantsFilteredByCategory'
import FullWidthButton from '../../Common/FullWidthButton'
import GrantCard from '../GrantCard/GrantCard'

import BudgetBanner from './BudgetBanner'
import { GrantCategoryFilter } from './CurrentGrantsCategoryFilters'
import './CurrentGrantsList.css'
import CurrentGrantsSortingMenu, { SortingKey } from './CurrentGrantsSortingMenu'

const CURRENT_GRANTS_PER_PAGE = 8

const CurrentGrantsList = ({ grants }: { grants: GrantWithUpdateAttributes[] }) => {
  const t = useFormatMessage()
  const [selectedCategory, setSelectedCategory] = useState<GrantCategoryFilter>(PROPOSAL_GRANT_CATEGORY_ALL)
  const [sortingKey, setSortingKey] = useState<SortingKey>(SortingKey.UpdateTimestamp)
  const sortedCurrentGrants = useMemo(() => orderBy(grants, [sortingKey], ['desc']), [grants, sortingKey])
  const [filteredCurrentGrants, setFilteredCurrentGrants] = useState<GrantWithUpdateAttributes[]>([])
  const currentGrantsFilteredByCategory = useCurrentGrantsFilteredByCategory(sortedCurrentGrants)

  useEffect(() => {
    if (!isEmpty(grants)) {
      setFilteredCurrentGrants(sortedCurrentGrants.slice(0, CURRENT_GRANTS_PER_PAGE))
    } else {
      setFilteredCurrentGrants([])
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
      <div className="CurrentGrantsList">
        <div className="CurrentGrants__TitleContainer">
          <div>
            <h2 className="CurrentGrants__Title">{t('page.grants.in_progress')}</h2>
          </div>
          <div className="CurrentGrants__Filters">
            <CurrentGrantsSortingMenu sortingKey={sortingKey} onSortingKeyChange={setSortingKey} />
          </div>
        </div>
        <BudgetBanner />
        <Container className="CurrentGrants__Container">
          {filteredCurrentGrants?.map((grant) => (
            <GrantCard key={`CurrentGrantCard_${grant.id}`} grant={grant} />
          ))}
        </Container>
        {showLoadMoreCurrentGrantsButton && (
          <FullWidthButton onClick={handleLoadMoreCurrentGrantsClick}>
            {t('page.grants.load_more_button')}
          </FullWidthButton>
        )}
      </div>
    </>
  )
}

export default CurrentGrantsList
