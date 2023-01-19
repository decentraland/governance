import React from 'react'

import { NewGrantCategory } from '../../entities/Grant/types'

import CategoryItem from './CategoryItem'
import './CategorySelector.css'

interface Props {
  onCategoryClick: (value: NewGrantCategory) => void
}

const CategorySelector = ({ onCategoryClick }: Props) => {
  return (
    <div className="CategorySelector">
      {Object.values(NewGrantCategory).map((category) => {
        return <CategoryItem key={category} category={category} onCategoryClick={onCategoryClick} />
      })}
    </div>
  )
}

export default CategorySelector
