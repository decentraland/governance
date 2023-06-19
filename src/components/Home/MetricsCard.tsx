import React from 'react'

import { Card } from 'decentraland-ui/dist/components/Card/Card'

import Link from '../Common/Link'

import HomeLoader from './HomeLoader'
import './MetricsCard.css'

interface Props {
  href?: string
  isLoading: boolean
  category: string
  title: string
  description: string
  loadingLabel: string
}

const MetricsCard = ({ href, category, title, description, isLoading, loadingLabel }: Props) => {
  return (
    <Card as={Link} href={href} className="MetricsCard">
      {!isLoading && (
        <div className="MetricsCard__Container">
          <p className="MetricsCard__Category">{category}</p>
          <h2 className="MetricsCard__Title">{title}</h2>
          <p className="MetricsCard__Description">{description}</p>
        </div>
      )}
      {isLoading && (
        <div className="MetricsCard__Container">
          <HomeLoader size="small">{loadingLabel}</HomeLoader>
        </div>
      )}
    </Card>
  )
}

export default MetricsCard
