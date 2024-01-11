import { useEffect, useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { DAO_DISCORD_URL, DOCS_URL } from '../../constants'
import { HIDE_HOME_BANNER_KEY } from '../../front/localStorageKeys'
import useFormatMessage from '../../hooks/useFormatMessage'
import Link from '../Common/Typography/Link'
import CloseCircle from '../Icon/CloseCircle'

import './MainBanner.css'

const shouldShowMainBanner = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(HIDE_HOME_BANNER_KEY) !== 'true'
  }
}

const MainBanner = () => {
  const t = useFormatMessage()
  const [showMainBanner, setShowMainBanner] = useState(false)

  useEffect(() => {
    setShowMainBanner(!!shouldShowMainBanner())
  }, [])

  if (!showMainBanner) {
    return null
  }

  const handleCloseMainBannerClick = () => {
    localStorage.setItem(HIDE_HOME_BANNER_KEY, 'true')
    setShowMainBanner(false)
  }

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
        onClick={handleCloseMainBannerClick}
      >
        <CloseCircle />
      </button>
    </div>
  )
}

export default MainBanner
