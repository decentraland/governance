import { OPEN_CALL_FOR_DELEGATES_LINK } from '../../../constants'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Delegate from '../../Icon/Delegate'
import { HIDE_LINK_DISCORD_MODAL_KEY } from '../../Modal/LinkDiscordModal/LinkDiscordModal'
import Banner from '../Banner'

import './LinkDiscordBanner.css'

const HIDE_LINK_DISCORD_BANNER_KEY = 'org.decentraland.governance.link_discord_banner.hide'

export const shouldShowLinkDiscordBanner = () => {
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem(HIDE_LINK_DISCORD_MODAL_KEY) === 'true' &&
      localStorage.getItem(HIDE_LINK_DISCORD_BANNER_KEY) !== 'true'
    )
  }

  return false
}

function LinkDiscordBanner() {
  const t = useFormatMessage()

  return (
    <div className="DelegationBanner__Container">
      <Banner
        className="LinkDiscordBanner"
        isVisible={shouldShowLinkDiscordBanner()}
        title={t(`banner.link_discord.title`)}
        description={t(`banner.link_discord.description`)}
        bannerHideKey={HIDE_LINK_DISCORD_BANNER_KEY}
        icon={<Delegate />}
        buttonLabel={t(`banner.link_discord.button_label`)}
        buttonHref={OPEN_CALL_FOR_DELEGATES_LINK}
      />
    </div>
  )
}

export default LinkDiscordBanner
