import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { DAO_DISCORD_URL, DOCS_URL } from '../../constants'
import CloseCircle from '../Icon/CloseCircle'

import './MainBanner.css'

interface Props {
  onCloseClick: () => void
}

const MainBanner = ({ onCloseClick }: Props) => {
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
      <button
        aria-label={t('page.home.main_banner.close_button_label')}
        className="MainBanner__CloseButton"
        onClick={onCloseClick}
      >
        <CloseCircle />
      </button>
    </div>
  )
}

export default MainBanner
