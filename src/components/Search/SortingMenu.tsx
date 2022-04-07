import React, { useMemo } from 'react'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import locations from '../../modules/locations'
import { useLocation } from '@reach/router'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'
import './SortingMenu.css'

export default function SortingMenu() {
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const order = useMemo(() => (params.get('order') === 'ASC' ? 'ASC' : 'DESC'), [params])
  const arrowDirection = useMemo(() => (order === 'ASC' ? 'Downwards' : 'Upwards'), [order])
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })

  const l = useFormatMessage()

  function handleSortingChange(e: React.MouseEvent<any>, value: string) {
    const newParams = new URLSearchParams(params)
    order ? newParams.set('order', value) : newParams.delete('order')
    newParams.delete('page')
    return navigate(locations.proposals(newParams))
  }

  return (
    <Dropdown
      className={TokenList.join(['SortingMenu', arrowDirection])}
      direction={isMobile ? 'left' : 'right'}
      text={l(`navigation.search.sorting.${order}`) || ''}
    >
      <Dropdown.Menu>
        <Dropdown.Item text={l('navigation.search.sorting.DESC')} onClick={(e) => handleSortingChange(e, 'DESC')} />
        <Dropdown.Item text={l('navigation.search.sorting.ASC')} onClick={(e) => handleSortingChange(e, 'ASC')} />
      </Dropdown.Menu>
    </Dropdown>
  )
}
