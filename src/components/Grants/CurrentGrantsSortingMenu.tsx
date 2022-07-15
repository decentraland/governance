import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

interface Props {
  onSortingKeyChange: (key: string) => void
}

const CurrentGrantsSortingMenu = ({ onSortingKeyChange }: Props) => {
  const t = useFormatMessage()
  const [sortingKey, setSortingKey] = useState('created_at')

  const handleSortingKeyChange = (newKey: string) => {
    setSortingKey(newKey)
    onSortingKeyChange(newKey)
  }

  return (
    <>
      <Dropdown
        direction="left"
        text={
          sortingKey === 'created_at'
            ? t('page.grants.sorting_filters.created_at')
            : t('page.grants.sorting_filters.amount')
        }
      >
        <Dropdown.Menu>
          <Dropdown.Item
            text={t('page.grants.sorting_filters.amount')}
            onClick={() => handleSortingKeyChange('size')}
          />
          <Dropdown.Item
            text={t('page.grants.sorting_filters.created_at')}
            onClick={() => handleSortingKeyChange('created_at')}
          />
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}

export default CurrentGrantsSortingMenu
