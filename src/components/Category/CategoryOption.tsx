import React, { Fragment, useMemo, useState } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import isNumber from 'lodash/isNumber'
import toSnakeCase from 'lodash/snakeCase'

import { NewGrantCategory } from '../../entities/Grant/types'
import { getNewGrantsCategoryIcon } from '../../entities/Grant/utils'
import { ProposalType } from '../../entities/Proposal/types'
import { CategoryIconVariant } from '../../helpers/styles'
import Arrow from '../Icon/Arrow'
import Subitem from '../Icon/Subitem'

import { categoryIcons } from './CategoryBanner'
import './CategoryOption.css'

enum SubtypeAlternativeOptions {
  All = 'All grants',
  Legacy = 'Legacy',
}

type SubtypeOptions = `${NewGrantCategory}` | `${SubtypeAlternativeOptions}`

export type CategoryOptionProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  active?: boolean
  type: string
  count?: number
  subtypes?: SubtypeOptions[]
}

const icons: Record<string, any> = {
  all_proposals: require('../../images/icons/all.svg').default,
  all_grants: require('../../images/icons/all.svg').default,
  community: require('../../images/icons/grant.svg').default,
  content_creator: require('../../images/icons/grant.svg').default,
  gaming: require('../../images/icons/grant.svg').default,
  platform_contributor: require('../../images/icons/grant.svg').default,
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

  return <img src={icons[type]} width="24" height="24" />
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
  const currentSubtype = useMemo(() => (params.get('subtype') as SubtypeOptions) || undefined, [params])

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
      url.searchParams.set('subtype', toSnakeCase(subtype))
    }
    const newHref = url.pathname + '?' + url.searchParams.toString()
    return newHref
  }
  const hasSubtypes = !!subtypes && subtypes.length > 0
  const [isSubcategoriesOpen, setIsSubcategoriesOpen] = useState(false)

  const isSubtypeActive = (subtype: SubtypeOptions) => {
    if (params.get('type') !== toSnakeCase(ProposalType.Grant)) {
      return false
    }

    if (subtype === SubtypeAlternativeOptions.All && !currentSubtype) {
      return true
    }

    return toSnakeCase(subtype) === currentSubtype
  }

  return (
    <Fragment>
      <a
        {...props}
        onClick={handleClick}
        className={TokenList.join([
          'CategoryOption',
          `CategoryOption--${type}`,
          active && 'CategoryOption--active',
          className,
        ])}
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
              className={TokenList.join([
                'CategoryOption__Arrow',
                isSubcategoriesOpen && 'CategoryOption__Arrow--active',
              ])}
              onClick={(e) => {
                e.preventDefault()
                setIsSubcategoriesOpen((prev) => !prev)
              }}
            >
              <Arrow filled={false} />
            </span>
          )}
        </span>
        {isNumber(count) && (
          <span className={TokenList.join(['CategoryOption__Counter', active && 'CategoryOption__Counter--active'])}>
            {count}
          </span>
        )}
      </a>
      {hasSubtypes && (
        <div
          className={TokenList.join([
            'CategoryOption__Subcategories',
            isSubcategoriesOpen && 'CategoryOption__Subcategories--active',
          ])}
        >
          {subtypes.map((subtype, index) => {
            return (
              <a
                className={TokenList.join([
                  'CategoryOption__SubcategoryItem',
                  isSubtypeActive(subtype) && 'CategoryOption__SubcategoryItem--active',
                ])}
                key={subtype + `-${index}`}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(getHref(subtype))
                }}
                href={getHref(subtype)}
              >
                <Subitem />
                {subtype}
              </a>
            )
          })}
        </div>
      )}
    </Fragment>
  )
})
