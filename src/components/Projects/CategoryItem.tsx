import { useState } from 'react'

import classNames from 'classnames'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import snakeCase from 'lodash/snakeCase'

import { NewGrantCategory } from '../../entities/Grant/types'
import { CategoryIconVariant } from '../../helpers/styles'
import useFormatMessage from '../../hooks/useFormatMessage'
import { getNewGrantsCategoryIcon } from '../Icon/NewGrantsCategoryIcons'

import './CategoryItem.css'

interface Props {
  category: NewGrantCategory
  onCategoryClick: (value: NewGrantCategory) => void
  disabled?: boolean
}

const CategoryItem = ({ category, onCategoryClick, disabled }: Props) => {
  const t = useFormatMessage()
  const Icon = getNewGrantsCategoryIcon(category)
  const [iconVariant, setIconVariant] = useState(CategoryIconVariant.Normal)

  return (
    <Card
      onMouseEnter={() => !disabled && setIconVariant(CategoryIconVariant.Hover)}
      onMouseLeave={() => !disabled && setIconVariant(CategoryIconVariant.Normal)}
      className={classNames('CategoryItem', disabled && 'CategoryItem--disabled')}
      onClick={() => !disabled && onCategoryClick(category)}
      disabled
    >
      <div>
        <Icon variant={iconVariant} size={42} />
      </div>
      <div className="CategoryItem__Content">
        <h2>{category}</h2>
        <p>{t(`page.submit_grant.${snakeCase(category)}_description`)}</p>
      </div>
    </Card>
  )
}

export default CategoryItem
