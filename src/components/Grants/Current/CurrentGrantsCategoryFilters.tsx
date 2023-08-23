import React, { useRef, useState } from 'react'
import Flickity from 'react-flickity-component'

import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { OldGrantCategory, ProposalGrantCategory } from '../../../entities/Grant/types'
import { GrantWithUpdate, PROPOSAL_GRANT_CATEGORY_ALL } from '../../../entities/Proposal/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import FilterButton from '../FilterButton'

import './CurrentGrantsCategoryFilters.css'

export type GrantCategoryFilter = ProposalGrantCategory | typeof PROPOSAL_GRANT_CATEGORY_ALL
const GRANTS_CATEGORY_FILTERS: GrantCategoryFilter[] = [
  PROPOSAL_GRANT_CATEGORY_ALL,
  OldGrantCategory.Community,
  OldGrantCategory.Gaming,
  OldGrantCategory.ContentCreator,
  OldGrantCategory.PlatformContributor,
]

interface Props {
  currentGrantsFilteredByCategory: Record<GrantCategoryFilter, GrantWithUpdate[]>
  onSelectedCategoryChange: (newCategory: GrantCategoryFilter) => void
}

const flickityOptions = {
  initialIndex: 0,
  cellSelector: '.CurrentGrantsCategoryFilters__CarouselCell',
  cellAlign: 'left',
  contain: true,
  accessibility: true,
  pageDots: false,
  wrapAround: false,
  groupCells: false,
  prevNextButtons: false,
  setGallerySize: true,
  draggable: true,
  freeScroll: false,
  dragThreshold: 10,
  selectedAttraction: 0.01,
  friction: 0.15,
  percentPosition: false,
}

const CurrentGrantsCategoryFilters = ({ currentGrantsFilteredByCategory, onSelectedCategoryChange }: Props) => {
  const t = useFormatMessage()
  const [selectedCategory, setSelectedCategory] = useState<GrantCategoryFilter>(PROPOSAL_GRANT_CATEGORY_ALL)
  const flickity = useRef<Flickity>()
  const isMobile = useMobileMediaQuery()

  const handleSelectedCategoryChange = (newCategory: GrantCategoryFilter) => {
    setSelectedCategory(newCategory)
    onSelectedCategoryChange(newCategory)
  }

  const content = GRANTS_CATEGORY_FILTERS.map((item) => (
    <FilterButton
      className={isMobile ? 'CurrentGrantsCategoryFilters__CarouselCell' : ''}
      key={item}
      selected={selectedCategory === item}
      onClick={() => handleSelectedCategoryChange(item)}
      count={currentGrantsFilteredByCategory[item]?.length}
    >
      {t(`page.grants.category_filters.${item.split(' ')[0].toLowerCase()}`)}
    </FilterButton>
  ))

  return (
    <>
      {isMobile ? (
        <Flickity
          className="CurrentGrantsCategoryFilters__Carousel"
          options={flickityOptions}
          flickityRef={(ref) => (flickity.current = ref)}
        >
          {content}
        </Flickity>
      ) : (
        <div className="CurrentGrantsCategoryFilters">{content}</div>
      )}
    </>
  )
}

export default CurrentGrantsCategoryFilters