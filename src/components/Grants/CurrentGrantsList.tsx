import React, { useCallback, useEffect, useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import { filter, isEmpty, orderBy } from 'lodash'

import { GrantWithUpdateAttributes, ProposalGrantCategory } from '../../entities/Proposal/types'
import { numberFormat } from '../../modules/intl'

import Banner, { BannerType } from './Banner'
import FilterButton from './FilterButton'
import GrantCard from './GrantCard'

const CURRENT_GRANTS_PER_PAGE = 8
const PROPOSAL_GRANT_CATEGORY_ALL = 'All'
type GrantCategoryFilter = ProposalGrantCategory | typeof PROPOSAL_GRANT_CATEGORY_ALL
const GRANTS_CATEGORY_FILTERS: GrantCategoryFilter[] = [
  PROPOSAL_GRANT_CATEGORY_ALL,
  ProposalGrantCategory.Community,
  ProposalGrantCategory.Gaming,
  ProposalGrantCategory.ContentCreator,
  ProposalGrantCategory.PlatformContributor,
]

const getBannerStats = (grants: GrantWithUpdateAttributes[]) => {
  if (isEmpty(grants)) {
    return {}
  }

  const releasedValues = grants.map((item) => {
    if (item.configuration.tier === 'Tier 1' || item.configuration.tier === 'Tier 2') {
      return item.size
    }

    const releasedPercentage = ((item.contract?.released || 0) * 100) / (item.contract?.vesting_total_amount || 0)

    return ((item.size || 0) * releasedPercentage) / 100
  })

  const totalReleased = releasedValues.filter(Number).reduce((prev, next) => prev! + next!, 0) || 0
  const toBeVestedValues = grants.map(
    (item) => (item.contract?.vesting_total_amount || 0) - (item.contract?.vestedAmount || 0)
  )
  const totalToBeVested = toBeVestedValues.filter(Number).reduce((prev, next) => prev! + next!, 0) || 0

  return {
    totalGrants: grants.length,
    totalReleased,
    totalToBeVested,
  }
}

const useCurrentGrantsFilteredByCategory = (grants: GrantWithUpdateAttributes[]) =>
  useMemo(
    () => ({
      [PROPOSAL_GRANT_CATEGORY_ALL]: grants,
      [ProposalGrantCategory.Community]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.Community
      ),
      [ProposalGrantCategory.Gaming]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.Gaming
      ),
      [ProposalGrantCategory.PlatformContributor]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.PlatformContributor
      ),
      [ProposalGrantCategory.ContentCreator]: filter(
        grants,
        (item) => item.configuration.category === ProposalGrantCategory.ContentCreator
      ),
    }),
    [grants]
  )

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

  const bannerStats = useMemo(() => getBannerStats(grants), [grants])
  const bannerItems = useMemo(
    () => [
      {
        title: t('page.grants.current_banner.active_grants_title', { value: bannerStats.totalGrants }),
        description: t('page.grants.current_banner.active_grants_description'),
      },
      {
        title: t('page.grants.current_banner.released_title', {
          value: numberFormat.format(bannerStats.totalReleased || 0),
        }),
        description: t('page.grants.current_banner.released_description'),
      },
      {
        title: t('page.grants.current_banner.to_be_vested_title', {
          value: numberFormat.format(bannerStats.totalToBeVested || 0),
        }),
        description: t('page.grants.current_banner.to_be_vested_description'),
      },
    ],
    [bannerStats, t]
  )

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
      <Banner
        type={BannerType.Current}
        title={t('page.grants.current_banner.title')}
        description={t('page.grants.current_banner.description')}
        items={bannerItems}
      />
      <div>
        <h2 className="GrantsPage__CurrentGrantsTitle">{t('page.grants.currently_funded')}</h2>
        <div className="GrantsPage__CurrentGrantsFilters">
          <div className="GrantsPage__CurrentGrantsCategoryFilters">
            {GRANTS_CATEGORY_FILTERS.map((item) => (
              <FilterButton
                key={item}
                selected={selectedCategory === item}
                onClick={() => setSelectedCategory(item)}
                count={currentGrantsFilteredByCategory[item]?.length}
              >
                {t(`page.grants.category_filters.${item.split(' ')[0].toLowerCase()}`)}
              </FilterButton>
            ))}
          </div>
          <Dropdown
            direction="left"
            text={
              sortingKey === 'created_at'
                ? t('page.grants.sorting_filters.created_at')
                : t('page.grants.sorting_filters.amount')
            }
          >
            <Dropdown.Menu>
              <Dropdown.Item text={t('page.grants.sorting_filters.amount')} onClick={() => setSortingKey('size')} />
              <Dropdown.Item
                text={t('page.grants.sorting_filters.created_at')}
                onClick={() => setSortingKey('created_at')}
              />
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <Container className="GrantsPage__CurrentGrantsContainer">
          {filteredCurrentGrants?.map((grant) => (
            <GrantCard key={`CurrentGrantCard_${grant.id}`} grant={grant} />
          ))}
        </Container>
      </div>
      {showLoadMoreCurrentGrantsButton && (
        <Button primary fluid className="GrantsPage_LoadMoreButton" onClick={handleLoadMoreCurrentGrantsClick}>
          {t('page.grants.load_more_button')}
        </Button>
      )}
    </>
  )
}

export default CurrentGrantsList
