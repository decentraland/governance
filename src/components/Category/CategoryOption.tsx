import React, { Fragment, useEffect, useMemo, useState } from 'react'

import { useLocation } from '@reach/router'
import classNames from 'classnames'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import isNumber from 'lodash/isNumber'
import toSnakeCase from 'lodash/snakeCase'

import { NewGrantCategory, SubtypeAlternativeOptions, SubtypeOptions, toGrantSubtype } from '../../entities/Grant/types'
import { getNewGrantsCategoryIcon } from '../../entities/Grant/utils'
import { ProposalType, toProposalType } from '../../entities/Proposal/types'
import { CategoryIconVariant } from '../../helpers/styles'
import Arrow from '../Icon/Arrow'
import All from '../Icon/ProposalCategories/All'
import Grant from '../Icon/ProposalCategories/Grant'
import SubItem from '../Icon/SubItem'

import { categoryIcons } from './CategoryBanner'
import './CategoryOption.css'

export type CategoryOptionProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  active?: boolean
  type: string
  count?: number
  subtypes?: SubtypeOptions[]
}

const icons: Record<string, any> = {
  all_proposals: All,
  all_grants: All,
  community: Grant,
  content_creator: Grant,
  gaming: Grant,
  platform_contributor: Grant,
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

  return <Icon size="24" />
}

export default React.memo(function CategoryOption({
  active,
  type,
  className,
  count,
  subtypes,
  ...props
}: CategoryOptionProps) {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const currentType = useMemo(() => toProposalType(params.get('type')), [params])
  const currentSubtype = useMemo(() => toGrantSubtype(params.get('subtype')), [params])

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (props.onClick) {
      props.onClick(e)
    }

    if (!e.defaultPrevented) {
      e.preventDefault()

      if (props.href) {
        navigate(props.href)
      }
    }
  }

  const getHref = (subtype: SubtypeOptions) => {
    const { href } = props
    const url = new URL(href || '/', 'http://localhost') // Create a URL object using a dummy URL
    if (subtype === SubtypeAlternativeOptions.All) {
      url.searchParams.delete('subtype')
    } else {
      url.searchParams.set('subtype', subtype)
    }
    const newHref = url.pathname + '?' + url.searchParams.toString()
    return newHref
  }
  const isGrant = currentType === ProposalType.Grant
  const hasSubtypes = !!subtypes && subtypes.length > 0
  const [isSubtypesOpen, setIsSubtypesOpen] = useState(isGrant)

  useEffect(() => {
    setIsSubtypesOpen(isGrant)
  }, [isGrant])

  const isSubtypeActive = (subtype: SubtypeOptions) => {
    if (params.get('type') !== toSnakeCase(ProposalType.Grant)) {
      return false
    }

    if (subtype === SubtypeAlternativeOptions.All && !currentSubtype) {
      return true
    }

    return toSnakeCase(subtype) === toSnakeCase(currentSubtype)
  }

  return (
    <Fragment>
      <a
        {...props}
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
            <Paragraph tiny semiBold>
              {t(`category.${type}_title`)}
            </Paragraph>
          </span>
          {hasSubtypes && (
            <span
              className={classNames('CategoryOption__Arrow', isSubtypesOpen && 'CategoryOption__Arrow--active')}
              onClick={(e) => {
                e.preventDefault()
                setIsSubtypesOpen((prev) => !prev)
              }}
            >
              <Arrow filled={false} color="var(--black-700)" />
            </span>
          )}
        </span>
        {isNumber(count) && (
          <span className={classNames('CategoryOption__Counter', active && 'CategoryOption__Counter--active')}>
            {count}
          </span>
        )}
      </a>
      {hasSubtypes && (
        <div
          className={classNames(
            'CategoryOption__Subcategories',
            isSubtypesOpen && 'CategoryOption__Subcategories--active'
          )}
        >
          {subtypes.map((subtype, index) => {
            return (
              <a
                className={classNames(
                  'CategoryOption__SubcategoryItem',
                  isSubtypeActive(subtype) && 'CategoryOption__SubcategoryItem--active'
                )}
                key={subtype + `-${index}`}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(getHref(subtype))
                }}
                href={getHref(subtype)}
              >
                <SubItem />
                {t(`category.${toSnakeCase(subtype)}_title`)}
              </a>
            )
          })}
        </div>
      )}
    </Fragment>
  )
})
