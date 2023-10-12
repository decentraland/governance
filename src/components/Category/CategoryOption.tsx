import { useCallback, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'
import isNumber from 'lodash/isNumber'
import toSnakeCase from 'lodash/snakeCase'

import { NewGrantCategory, SubtypeAlternativeOptions, SubtypeOptions, toGrantSubtype } from '../../entities/Grant/types'
import { ProposalType } from '../../entities/Proposal/types'
import { CategoryIconVariant } from '../../helpers/styles'
import useFormatMessage from '../../hooks/useFormatMessage'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import Arrow from '../Icon/Arrow'
import { getNewGrantsCategoryIcon } from '../Icon/NewGrantsCategoryIcons'
import All from '../Icon/ProposalCategories/All'
import Grant from '../Icon/ProposalCategories/Grant'
import Tender from '../Icon/ProposalCategories/Tender'
import SubItem from '../Icon/SubItem'
import { ProjectTypeFilter } from '../Search/CategoryFilter'

import { categoryIcons } from './CategoryBanner'
import './CategoryOption.css'

type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  active?: boolean
  type: string
  count?: number
  subtypes?: SubtypeOptions[]
  onClick?: () => void
}

const icons: Record<string, any> = {
  all_proposals: All,
  all_projects: All,
  community: Grant,
  content_creator: Grant,
  gaming: Grant,
  platform_contributor: Grant,
  grants: Grant,
  bidding_and_tendering: Tender,
  legacy: Grant,
  ...categoryIcons,
}

export const getCategoryIcon = (type: string, variant?: CategoryIconVariant, size?: number) => {
  const newGrants = Object.values(NewGrantCategory)
  const newGrantIndex = newGrants.map(toSnakeCase).indexOf(type)
  const isNewGrant = newGrantIndex !== -1
  if (isNewGrant) {
    const icon = getNewGrantsCategoryIcon(newGrants[newGrantIndex])
    return icon({ variant: variant || CategoryIconVariant.Filled, size: size })
  }

  const Icon = icons[type]

  return (
    <div className="CategoryOption__IconContainer">
      <Icon size="24" />
    </div>
  )
}

const getHref = (href: string | undefined, subtype: SubtypeOptions) => {
  const url = new URL(href || '/', 'http://localhost') // Create a URL object using a dummy URL
  if (subtype === SubtypeAlternativeOptions.All) {
    url.searchParams.delete('subtype')
  } else {
    url.searchParams.set('subtype', subtype)
  }
  const newHref = url.pathname + '?' + url.searchParams.toString()
  return newHref
}

export default function CategoryOption({ active, type, className, count, subtypes, onClick, ...props }: Props) {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const currentType = useMemo(() => params.get('type'), [params])
  const currentSubtype = useMemo(() => toGrantSubtype(params.get('subtype')), [params])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(e)
      }
    },
    [onClick]
  )

  const isGrant = currentType === ProposalType.Grant || currentType === ProjectTypeFilter.Grants
  const hasSubtypes = !!subtypes && subtypes.length > 0
  const [isSubtypesOpen, setIsSubtypesOpen] = useState(isGrant)

  useEffect(() => {
    setIsSubtypesOpen(isGrant)
  }, [isGrant, currentType])

  const isSubtypeActive = useCallback(
    (subtype: SubtypeOptions) => {
      if (subtype === SubtypeAlternativeOptions.All && !currentSubtype) {
        return true
      }

      return toSnakeCase(subtype) === toSnakeCase(currentSubtype)
    },
    [currentSubtype]
  )

  return (
    <>
      <Link
        {...props}
        href={props.href || undefined}
        onClick={handleClick}
        className={classNames(
          'CategoryOption',
          `CategoryOption--${type}`,
          active && 'CategoryOption--active',
          className
        )}
      >
        <span className="CategoryOption__TitleContainer">
          <span>
            {getCategoryIcon(type, CategoryIconVariant.Circled)}
            <Text className="CategoryOption__Title">{t(`category.${type}_title`)}</Text>
          </span>
          {/* {hasSubtypes && (
            <span
              className={classNames('CategoryOption__Arrow', isSubtypesOpen && 'CategoryOption__Arrow--active')}
              onClick={(e) => {
                e.preventDefault()
                setIsSubtypesOpen((prev) => !prev)
              }}
            >
              <Arrow filled={false} color="var(--black-700)" />
            </span>
          )} */}
        </span>
        {isNumber(count) && (
          <span className={classNames('CategoryOption__Counter', active && 'CategoryOption__Counter--active')}>
            {count}
          </span>
        )}
      </Link>
      {/* {hasSubtypes && (
        <div
          className={classNames(
            'CategoryOption__Subcategories',
            isSubtypesOpen && 'CategoryOption__Subcategories--active'
          )}
        >
          {subtypes.map((subtype, index) => {
            return (
              <Link
                className={classNames(
                  'CategoryOption__SubcategoryItem',
                  isSubtypeActive(subtype) && 'CategoryOption__SubcategoryItem--active'
                )}
                key={subtype + `-${index}`}
                // href={getHref(props.href, subtype)}
              >
                <SubItem />
                {t(`category.${toSnakeCase(subtype)}_title`)}
              </Link>
            )
          })}
        </div>
      )} */}
    </>
  )
}
