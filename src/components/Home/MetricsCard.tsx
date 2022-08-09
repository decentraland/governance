import React from 'react'

import './MetricsCard.css'

interface Props {
  category: string
  title: string
  description: string
}

const MetricsCard = ({ category, title, description }: Props) => {
  return (
    <div className="MetricsCard">
      <p className="MetricsCard__Category">{category}</p>
      <h2 className="MetricsCard__Title">{title}</h2>
      <p className="MetricsCard__Description">{description}</p>
    </div>
  )
}

export default MetricsCard
