import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import './LoadingView.css'

const LoadingView = ({ withNavigation = false }: { withNavigation?: boolean }) => {
  return (
    <Container className={TokenList.join(['LoadingView', withNavigation && 'LoadingView--withNavigation'])}>
      <Loader size="huge" active />
    </Container>
  )
}

export default LoadingView
