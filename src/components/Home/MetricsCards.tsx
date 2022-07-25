import React, { useRef } from 'react'
import Flickity from 'react-flickity-component'

import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'

import MetricsCard from './MetricsCard'
import './MetricsCards.css'

const flickityOptions = {
  cellAlign: 'left',
  accessibility: true,
  pageDots: false,
  prevNextButtons: false,
  draggable: true,
  dragThreshold: 10,
  selectedAttraction: 0.01,
  friction: 0.15,
}

const MOCK_DATA = [
  { category: 'Proposals', title: '48 active proposals', description: '5 ending soon' },
  { category: 'Participation', title: '165 votes this week', description: '542 votes last 30 days' },
  { category: 'Treasury', title: '$45,467,895.28', description: 'Consolidated in USD' },
]

const MetricsCards = () => {
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })
  const flickity = useRef<Flickity>()

  const content = MOCK_DATA.map((item) => (
    <MetricsCard key={item.category} category={item.category} title={item.title} description={item.description} />
  ))

  return (
    <>
      {isMobile ? (
        <Flickity
          className="MetricsCards__Carousel"
          options={flickityOptions}
          flickityRef={(ref) => (flickity.current = ref)}
        >
          {content}
        </Flickity>
      ) : (
        <Container>
          <div className="MetricsCards">{content}</div>
        </Container>
      )}
    </>
  )
}

export default MetricsCards
