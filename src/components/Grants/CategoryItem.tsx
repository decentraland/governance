import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { snakeCase } from 'lodash'

import { ProposalGrantCategory } from '../../entities/Proposal/types'
import { CategoryIconVariant } from '../../helpers/styles'
import Accelerator from '../Icon/Accelerator'
import CoreUnit from '../Icon/CoreUnit'
import Documentation from '../Icon/Documentation'
import InWorldContent from '../Icon/InWorldContent'
import Platform from '../Icon/Platform'
import SocialMediaContent from '../Icon/SocialMediaContent'
import Sponsorship from '../Icon/Sponsorship'

const getIcon = (category: ProposalGrantCategory) => {
  switch (category) {
    case ProposalGrantCategory.Accelerator:
      return Accelerator
    case ProposalGrantCategory.CoreUnit:
      return CoreUnit
    case ProposalGrantCategory.Documentation:
      return Documentation
    case ProposalGrantCategory.InWorldContent:
      return InWorldContent
    case ProposalGrantCategory.Platform:
      return Platform
    case ProposalGrantCategory.SocialMediaContent:
      return SocialMediaContent
    case ProposalGrantCategory.Sponsorship:
    default:
      return Sponsorship
  }
}

interface Props {
  category: ProposalGrantCategory
  onCategoryClick: (value: ProposalGrantCategory) => void
}

const CategoryItem = ({ category, onCategoryClick }: Props) => {
  const t = useFormatMessage()
  const Icon = getIcon(category)
  const [iconVariant, setIconVariant] = useState(CategoryIconVariant.Normal)

  return (
    <Card
      onMouseEnter={() => setIconVariant(CategoryIconVariant.Hover)}
      onMouseLeave={() => setIconVariant(CategoryIconVariant.Normal)}
      className="CategorySelector__Item"
      onClick={() => onCategoryClick(category)}
    >
      <div>
        <Icon variant={iconVariant} />
      </div>
      <div className="CategorySelector__Content">
        <h2>{category}</h2>
        <p>{t(`page.submit_grant.${snakeCase(category)}_description`)}</p>
      </div>
    </Card>
  )
}

export default CategoryItem
