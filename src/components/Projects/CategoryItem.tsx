import { useState } from 'react'

import { Card } from 'decentraland-ui/dist/components/Card/Card'
import snakeCase from 'lodash/snakeCase'

import { NewGrantCategory } from '../../entities/Grant/types'
import { CategoryIconVariant } from '../../helpers/styles'
import useFormatMessage from '../../hooks/useFormatMessage'
import { getNewGrantsCategoryIcon } from '../Icon/NewGrantsCategoryIcons'

interface Props {
  category: NewGrantCategory
  onCategoryClick: (value: NewGrantCategory) => void
}

const CategoryItem = ({ category, onCategoryClick }: Props) => {
  const t = useFormatMessage()
  const Icon = getNewGrantsCategoryIcon(category)
  const [iconVariant, setIconVariant] = useState(CategoryIconVariant.Normal)

  return (
    <Card
      onMouseEnter={() => setIconVariant(CategoryIconVariant.Hover)}
      onMouseLeave={() => setIconVariant(CategoryIconVariant.Normal)}
      className="CategorySelector__Item"
      onClick={() => onCategoryClick(category)}
    >
      <div>
        <Icon variant={iconVariant} size={42} />
      </div>
      <div className="CategorySelector__Content">
        <h2>{category}</h2>
        <p>{t(`page.submit_grant.${snakeCase(category)}_description`)}</p>
      </div>
    </Card>
  )
}

export default CategoryItem
