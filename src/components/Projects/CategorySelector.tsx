import { NewGrantCategory, VALID_CATEGORIES } from '../../entities/Grant/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import Markdown from '../Common/Typography/Markdown'

import CategoryItem from './CategoryItem'
import './CategorySelector.css'

interface Props {
  onCategoryClick: (value: NewGrantCategory) => void
}

const CategorySelector = ({ onCategoryClick }: Props) => {
  const t = useFormatMessage()

  return (
    <div className="CategorySelector">
      <p className="CategorySelector__Description">{t('page.submit_grant.category_selection.description')}</p>
      <div className="CategorySelector__ItemsContainer">
        {VALID_CATEGORIES.map((category) => {
          return <CategoryItem key={category} category={category} onCategoryClick={onCategoryClick} />
        })}
      </div>
      <Markdown componentsClassNames={{ p: 'CategorySelector__DocumentationText' }}>
        {t('page.submit_grant.category_selection.documentation')}
      </Markdown>
    </div>
  )
}

export default CategorySelector
