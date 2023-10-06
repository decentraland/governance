import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'

import Navigation from '../components/Layout/Navigation'
import useFormatMessage from '../hooks/useFormatMessage'

export default function NotFoundPage() {
  const t = useFormatMessage()
  const title = t('page.404.title')!
  const description = t('page.404.description')!

  return (
    <>
      <Navigation />
      <NotFound title={title} description={description} />
    </>
  )
}
