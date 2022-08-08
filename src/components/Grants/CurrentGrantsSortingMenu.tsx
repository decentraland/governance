import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

export enum SortingKey {
  CreatedAt = 'created_at',
  UpdateTimestamp = 'update_timestamp',
  Size = 'size',
}

interface Props {
  sortingKey: SortingKey
  onSortingKeyChange: (key: SortingKey) => void
}

const SortingTextKey: Record<SortingKey, string> = {
  created_at: 'page.grants.sorting_filters.created_at',
  size: 'page.grants.sorting_filters.amount',
  update_timestamp: 'page.grants.sorting_filters.update_timestamp',
}

const CurrentGrantsSortingMenu = ({ sortingKey, onSortingKeyChange }: Props) => {
  const t = useFormatMessage()

  return (
    <>
      <Dropdown className="CurrentGrantsSortingMenu" direction="right" text={t(SortingTextKey[sortingKey])}>
        <Dropdown.Menu>
          <Dropdown.Item
            text={t('page.grants.sorting_filters.amount')}
            onClick={() => onSortingKeyChange(SortingKey.Size)}
          />
          <Dropdown.Item
            text={t('page.grants.sorting_filters.created_at')}
            onClick={() => onSortingKeyChange(SortingKey.CreatedAt)}
          />
          <Dropdown.Item
            text={t('page.grants.sorting_filters.update_timestamp')}
            onClick={() => onSortingKeyChange(SortingKey.UpdateTimestamp)}
          />
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}

export default CurrentGrantsSortingMenu
