import React from 'react'

import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import './LoadingView.css'

const LoadingView = () => {
  return (
    <Container className="LoadingView">
      <Loader size="huge" active />
    </Container>
  )
}

export default LoadingView
