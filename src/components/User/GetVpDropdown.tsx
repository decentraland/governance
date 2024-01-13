import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { BUY_LAND_URL, BUY_MANA_URL, BUY_NAME_URL, BUY_WEARABLES_URL } from '../../constants'
import useFormatMessage from '../../hooks/useFormatMessage'
import Link from '../Common/Typography/Link'

import './GetVpDropdown.css'

export default function GetVpDropdown() {
  const isMobile = useMobileMediaQuery()
  const t = useFormatMessage()

  const buttonText = isMobile ? t('page.profile.get_vp_dropdown.get_vp') : t('page.profile.get_vp_dropdown.get_more_vp')

  return (
    <Dropdown className="GetVpDropdown" text={buttonText} button direction="left">
      <Dropdown.Menu>
        <Dropdown.Item as={Link} href={BUY_LAND_URL}>
          {t('page.profile.get_vp_dropdown.land')}
        </Dropdown.Item>
        <Dropdown.Item as={Link} href={BUY_WEARABLES_URL}>
          {t('page.profile.get_vp_dropdown.l1_wearables')}
        </Dropdown.Item>
        <Dropdown.Item as={Link} href={BUY_NAME_URL}>
          {t('page.profile.get_vp_dropdown.names')}
        </Dropdown.Item>
        <Dropdown.Item as={Link} href={BUY_MANA_URL}>
          {t('page.profile.get_vp_dropdown.mana')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
