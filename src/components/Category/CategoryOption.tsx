import { useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'
import isNumber from 'lodash/isNumber'
import toSnakeCase from 'lodash/snakeCase'

import { SubtypeOptions } from '../../entities/Grant/types'
import { BiddingProcessType, ImplementationProcessType, ProposalType } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import Arrow from '../Icon/Arrow'
import SubItem from '../Icon/SubItem'
import { ProjectTypeFilter } from '../Search/CategoryFilter'

import './CategoryOption.css'

type Props = {
  active?: boolean
  type: ProposalType | 'all_proposals' | ProjectTypeFilter | 'implementation'
  count?: number
  onClick?: () => void
  href?: string
  className?: string
  subcategories?: SubtypeOptions[] | ImplementationProcessType[] | BiddingProcessType[]
  isSubcategoryActive?: (subcategory: string) => boolean
  subcategoryHref?: (href: string | undefined, subcategory: string) => string
  icon: React.ReactElement
  title: string
}

export default function CategoryOption({
  href,
  active,
  type,
  className,
  count,
  onClick,
  icon,
  title,
  subcategories,
  subcategoryHref,
  isSubcategoryActive,
}: Props) {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const currentType = useMemo(() => params.get('type'), [params])
  const isGroupSelected = useMemo(() => !!subcategories?.includes(currentType as never), [subcategories, currentType])

  const [isGroupExpanded, setIsGroupExpanded] = useState(isGroupSelected)

  useEffect(() => {
    setIsGroupExpanded(isGroupSelected)
  }, [isGroupSelected, currentType])

  return (
    <>
      <Link
        href={href || undefined}
        className={classNames(
          'CategoryOption',
          `CategoryOption--${type}`,
          active && 'CategoryOption--active',
          className
        )}
        onClick={(e) => {
          e.preventDefault()
          setIsGroupExpanded((prev) => !prev)
          onClick?.()
        }}
      >
        <span className="CategoryOption__TitleContainer">
          <span>
            <div className="CategoryOption__IconContainer">{icon}</div>
            <Text weight={active ? 'medium' : 'normal'} className="CategoryOption__Title">
              {title}
            </Text>
          </span>
          {subcategories && (
            <span className={classNames('CategoryOption__Arrow', isGroupExpanded && 'CategoryOption__Arrow--active')}>
              <Arrow filled={false} color="var(--black-700)" />
            </span>
          )}
        </span>
        {isNumber(count) && (
          <span className={classNames('CategoryOption__Counter', active && 'CategoryOption__Counter--active')}>
            {count}
          </span>
        )}
      </Link>
      {subcategories && (
        <div
          className={classNames(
            'CategoryOption__Subcategories',
            `CategoryOption__Subcategories--${type}`,
            isGroupExpanded && 'CategoryOption__Subcategories--active'
          )}
        >
          {subcategories.map((item, index) => {
            return (
              <Link
                className={classNames(
                  'CategoryOption__SubcategoryItem',
                  isSubcategoryActive?.(item) && 'CategoryOption__SubcategoryItem--active'
                )}
                key={item + `-${index}`}
                href={subcategoryHref?.(href, item)}
              >
                <SubItem />
                {t(`category.${toSnakeCase(item)}_title`)}
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
