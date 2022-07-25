import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { DOCS_URL } from '../../constants'

import './MainBanner.css'

const DAO_DISCORD_URL = 'https://discord.gg/amkcFrqPBh'

const MainBanner = () => {
  const t = useFormatMessage()

  return (
    <div className="MainBanner">
      <div className="MainBanner__Background" />
      <h2 className="MainBanner__Title">{t('page.home.main_banner.title')}</h2>
      <p className="MainBanner__Description">{t('page.home.main_banner.description')}</p>
      <div className="MainBanner__ButtonsContainer">
        <Button as={Link} href={DAO_DISCORD_URL} className="MainBanner__Button MainBanner__DiscordButton">
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
