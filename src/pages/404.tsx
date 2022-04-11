import React from 'react'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Navigation from '../components/Layout/Navigation'

export default React.memo(function NotFoundPage() {
  const t = useFormatMessage()
  const title = t('page.404.title')!
  const description = t('page.404.description')!

  return (
    <>
      <Navigation />
      <NotFound title={title} description={description} />
    </>
  )
})
