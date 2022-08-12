import React from 'react'

import HomeLoader from './HomeLoader'
import './MetricsCard.css'

interface Props {
  isLoading: boolean
  category: string
  title: string
  description: string
  loadingLabel: string
}

const MetricsCard = ({ category, title, description, isLoading, loadingLabel }: Props) => {
  return (
    <div className="MetricsCard">
      {!isLoading && (
        <>
          <p className="MetricsCard__Category">{category}</p>
          <h2 className="MetricsCard__Title">{title}</h2>
          <p className="MetricsCard__Description">{description}</p>
        </>
      )}
      {isLoading && <HomeLoader size="small">{loadingLabel}</HomeLoader>}
    </div>
  )
}

export default MetricsCard
