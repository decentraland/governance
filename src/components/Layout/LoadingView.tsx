import React from 'react'

import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

const LoadingView = () => {
  return (
    <Container className="WelcomePage">
      <div>
        <Loader size="huge" active />
      </div>
    </Container>
  )
}

export default LoadingView
