import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ProposalGrantCategory, VALID_CATEGORIES } from '../../entities/Proposal/types'

import CategoryItem from './CategoryItem'
import './CategorySelector.css'

interface Props {
  onCategoryClick: (value: ProposalGrantCategory) => void
}

const CategorySelector = ({ onCategoryClick }: Props) => {
  const t = useFormatMessage()

  return (
    <div>
      <p className="CategorySelector__Description">{t('page.submit_grant.category_selection.description')}</p>
      <div className="CategorySelector__ItemsContainer">
        {VALID_CATEGORIES.map((category) => {
          return <CategoryItem key={category} category={category} onCategoryClick={onCategoryClick} />
        })}
      </div>
      <Markdown className="CategorySelector__Documentation">
        {t('page.submit_grant.category_selection.documentation')}
      </Markdown>
    </div>
  )
}

export default CategorySelector
