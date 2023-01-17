import React from 'react'

import { ProposalGrantCategory, VALID_CATEGORIES } from '../../entities/Proposal/types'

import CategoryItem from './CategoryItem'
import './CategorySelector.css'

interface Props {
  onCategoryClick: (value: ProposalGrantCategory) => void
}

const CategorySelector = ({ onCategoryClick }: Props) => {
  return (
    <div className="CategorySelector">
      {VALID_CATEGORIES.map((category) => {
        return <CategoryItem key={category} category={category} onCategoryClick={onCategoryClick} />
      })}
    </div>
  )
}

export default CategorySelector
