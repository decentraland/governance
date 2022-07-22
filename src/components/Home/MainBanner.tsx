import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import './MainBanner.css'

const DISCORD_URL = process.env.GATSBY_JOIN_DISCORD_URL // TODO: Use DAO discord URL
const DOCS_URL = 'https://docs.decentraland.org/decentraland/what-is-the-dao/' // TODO: This is used in transparency, where should we store this variable?

const MainBanner = () => {
  const t = useFormatMessage()

  return (
    <div className="MainBanner">
      <div className="MainBanner__Background" />
      <h2 className="MainBanner__Title">{t('page.home.main_banner.title')}</h2>
      <p className="MainBanner__Description">{t('page.home.main_banner.description')}</p>
      <div className="MainBanner__ButtonsContainer">
        <Button as={Link} href={DISCORD_URL} className="MainBanner__Button MainBanner__DiscordButton">
          {t('page.home.main_banner.discord_button')}
        </Button>
        <Button as={Link} href={DOCS_URL} className="MainBanner__Button MainBanner__DocsButton">
          {t('page.home.main_banner.docs_button')}
        </Button>
      </div>
    </div>
  )
}

export default MainBanner
