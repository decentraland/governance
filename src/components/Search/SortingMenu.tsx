import { useMemo } from 'react'

import { useLocation } from '@reach/router'
import classNames from 'classnames'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { SortingOrder } from '../../entities/Proposal/types'
import { toSortingOrder } from '../../entities/Proposal/utils'
import { getUrlFilters } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import { navigate } from '../../utils/locations'

import './SortingMenu.css'

const SORT_KEY = 'order'

export default function SortingMenu() {
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const isSearching = !!params.get('search')
  const order = toSortingOrder(params.get('order'), () => (isSearching ? 'RELEVANCE' : SortingOrder.DESC))
  const arrowDirection = order === SortingOrder.ASC ? 'Upwards' : 'Downwards'
  const isMobile = useMobileMediaQuery()

  const t = useFormatMessage()

  return (
    <Dropdown
      className={classNames('SortingMenu', arrowDirection)}
      direction={isMobile ? 'left' : 'right'}
      text={t(`navigation.search.sorting.${order}`) || ''}
    >
      <Dropdown.Menu>
        {isSearching && (
          <Dropdown.Item
            text={t('navigation.search.sorting.RELEVANCE')}
            onClick={() => navigate(getUrlFilters(SORT_KEY, params, undefined))}
          />
        )}
        <Dropdown.Item
          text={t('navigation.search.sorting.DESC')}
          onClick={() => navigate(getUrlFilters(SORT_KEY, params, SortingOrder.DESC))}
        />
        <Dropdown.Item
          text={t('navigation.search.sorting.ASC')}
          onClick={() => navigate(getUrlFilters(SORT_KEY, params, SortingOrder.ASC))}
        />
      </Dropdown.Menu>
    </Dropdown>
  )
}
