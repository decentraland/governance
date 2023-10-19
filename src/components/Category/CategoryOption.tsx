import { useCallback } from 'react'

import classNames from 'classnames'
import isNumber from 'lodash/isNumber'
import toSnakeCase from 'lodash/snakeCase'

import { NewGrantCategory } from '../../entities/Grant/types'
import { CategoryIconVariant } from '../../helpers/styles'
import useFormatMessage from '../../hooks/useFormatMessage'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import { getNewGrantsCategoryIcon } from '../Icon/NewGrantsCategoryIcons'
import All from '../Icon/ProposalCategories/All'
import Grant from '../Icon/ProposalCategories/Grant'
import Tender from '../Icon/ProposalCategories/Tender'

import { categoryIcons } from './CategoryBanner'
import './CategoryOption.css'

export type CategoryOptionProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  active?: boolean
  type: string
  count?: number
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

export default function CategoryOption({ active, type, className, count, onClick, ...props }: CategoryOptionProps) {
  const t = useFormatMessage()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(e)
      }
    },
    [onClick]
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
            <Text weight={active ? 'medium' : 'normal'} className="CategoryOption__Title">
              {t(`category.${type}_title`)}
            </Text>
          </span>
        </span>
        {isNumber(count) && (
          <span className={classNames('CategoryOption__Counter', active && 'CategoryOption__Counter--active')}>
            {count}
          </span>
        )}
      </Link>
    </>
  )
}
