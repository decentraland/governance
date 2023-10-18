import { useCallback, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'
import isNumber from 'lodash/isNumber'
import toSnakeCase from 'lodash/snakeCase'

import { BiddingProposalType, GovernanceProposalType } from '../../entities/Proposal/types'
import { getUrlFilters } from '../../helpers'
import useFormatMessage from '../../hooks/useFormatMessage'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import Arrow from '../Icon/Arrow'
import Governance from '../Icon/ProposalCategories/Governance'
import Tender from '../Icon/ProposalCategories/Tender'
import SubItem from '../Icon/SubItem'

import { CategoryOptionProps } from './CategoryOption'

type ValueOf<T> = T[keyof T]

type Props = CategoryOptionProps & {
  group: ValueOf<typeof GovernanceProposalType>[] | ValueOf<typeof BiddingProposalType>[]
}

const icons: Record<string, React.ReactNode> = {
  implementation: <Governance size={24} />,
  bidding_and_tendering: <Tender size={24} />,
}

function GroupedCategoryOption({ active, type, className, count, group, ...props }: Props) {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const currentType = useMemo(() => params.get('type'), [params])
  const isGroupSelected = useMemo(() => group.includes(currentType as never), [group, currentType])

  const [isGroupExpanded, setIsGroupExpanded] = useState(isGroupSelected)

  useEffect(() => {
    setIsGroupExpanded(isGroupSelected)
  }, [isGroupSelected, currentType])

  const isSubtypeActive = useCallback(
    (item: string) => {
      return toSnakeCase(item) === toSnakeCase(currentType ?? '')
    },
    [currentType]
  )

  return (
    <>
      <Link
        {...props}
        href={props.href || undefined}
        className={classNames(
          'CategoryOption',
          `CategoryOption--${type}`,
          active && 'CategoryOption--active',
          className
        )}
        onClick={(e) => {
          e.preventDefault()
          setIsGroupExpanded((prev) => !prev)
        }}
      >
        <span className="CategoryOption__TitleContainer">
          <span>
            <div className="CategoryOption__IconContainer">{icons[type]}</div>
            <Text className="CategoryOption__Title">{t(`category.${type}_title`)}</Text>
          </span>
          <span className={classNames('CategoryOption__Arrow', isGroupExpanded && 'CategoryOption__Arrow--active')}>
            <Arrow filled={false} color="var(--black-700)" />
          </span>
        </span>
        {isNumber(count) && (
          <span className={classNames('CategoryOption__Counter', active && 'CategoryOption__Counter--active')}>
            {count}
          </span>
        )}
      </Link>
      <div
        className={classNames(
          'CategoryOption__Subcategories',
          `CategoryOption__Subcategories--${type}`,
          isGroupExpanded && 'CategoryOption__Subcategories--active'
        )}
      >
        {group.map((item, index) => {
          return (
            <Link
              className={classNames(
                'CategoryOption__SubcategoryItem',
                isSubtypeActive(item) && 'CategoryOption__SubcategoryItem--active'
              )}
              key={item + `-${index}`}
              href={getUrlFilters('type', params, item)}
            >
              <SubItem />
              {t(`category.${toSnakeCase(item)}_title`)}
            </Link>
          )
        })}
      </div>
    </>
  )
}

export default GroupedCategoryOption
