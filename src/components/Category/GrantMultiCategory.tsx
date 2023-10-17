import { useCallback, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'
import isNumber from 'lodash/isNumber'
import toSnakeCase from 'lodash/snakeCase'

import { SubtypeAlternativeOptions, SubtypeOptions, toGrantSubtype } from '../../entities/Grant/types'
import { ProposalType } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import Arrow from '../Icon/Arrow'
import Grant from '../Icon/ProposalCategories/Grant'
import SubItem from '../Icon/SubItem'
import { ProjectTypeFilter } from '../Search/CategoryFilter'

import { CategoryOptionProps } from './CategoryOption'

type Props = CategoryOptionProps & {
  subtypes: SubtypeOptions[]
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

function GrantMultiCategory({ active, type, className, count, subtypes, ...props }: Props) {
  const t = useFormatMessage()
  const params = useURLSearchParams()
  const currentType = useMemo(() => params.get('type'), [params])
  const currentSubtype = useMemo(() => toGrantSubtype(params.get('subtype')), [params])

  const isGrant = currentType === ProposalType.Grant || currentType === ProjectTypeFilter.Grants
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
        className={classNames(
          'CategoryOption',
          `CategoryOption--${type}`,
          active && 'CategoryOption--active',
          className
        )}
      >
        <span className="CategoryOption__TitleContainer">
          <span>
            <div className="CategoryOption__IconContainer">
              <Grant size={24} />
            </div>
            <Text className="CategoryOption__Title">{t(`category.${type}_title`)}</Text>
          </span>
          <span
            className={classNames('CategoryOption__Arrow', isSubtypesOpen && 'CategoryOption__Arrow--active')}
            onClick={(e) => {
              e.preventDefault()
              setIsSubtypesOpen((prev) => !prev)
            }}
          >
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
              href={getHref(props.href, subtype)}
            >
              <SubItem />
              {t(`category.${toSnakeCase(subtype)}_title`)}
            </Link>
          )
        })}
      </div>
    </>
  )
}

export default GrantMultiCategory
