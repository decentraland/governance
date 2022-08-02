import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'

export enum SortingKeys {
  CreatedAt = 'created_at',
  UpdateTimestamp = 'update_timestamp',
  Size = 'size',
}

interface Props {
  sortingKey: SortingKeys
  onSortingKeyChange: (key: SortingKeys) => void
}

const SortingTextKey: Record<SortingKeys, string> = {
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
            onClick={() => onSortingKeyChange(SortingKeys.Size)}
          />
          <Dropdown.Item
            text={t('page.grants.sorting_filters.created_at')}
            onClick={() => onSortingKeyChange(SortingKeys.CreatedAt)}
          />
          <Dropdown.Item
            text={t('page.grants.sorting_filters.update_timestamp')}
            onClick={() => onSortingKeyChange(SortingKeys.UpdateTimestamp)}
          />
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}

export default CurrentGrantsSortingMenu
