import { Dropdown } from 'decentraland-ui/dist/components/Dropdown/Dropdown'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import useFormatMessage from '../../hooks/useFormatMessage'

import './GetVpDropdown.css'

export default function GetVpDropdown() {
  const isMobile = useMobileMediaQuery()
  const t = useFormatMessage()

  const buttonText = isMobile ? t('page.profile.get_vp_dropdown.get_vp') : t('page.profile.get_vp_dropdown.get_more_vp')

  return (
    <Dropdown className="GetVpDropdown" text={buttonText} button direction="left">
      <Dropdown.Menu>
        <Dropdown.Item
          as="a"
          href="https://decentraland.org/marketplace/lands?assetType=nft&section=land&vendor=decentraland&page=1&sortBy=newest&onlyOnSale=true"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('page.profile.get_vp_dropdown.land')}
        </Dropdown.Item>
        <Dropdown.Item
          as="a"
          href="https://decentraland.org/marketplace/browse?assetType=item&section=wearables&vendor=decentraland&page=1&sortBy=newest&status=on_sale&network=ETHEREUM"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('page.profile.get_vp_dropdown.l1_wearables')}
        </Dropdown.Item>
        <Dropdown.Item
          as="a"
          href="https://decentraland.org/builder/claim-name"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('page.profile.get_vp_dropdown.names')}
        </Dropdown.Item>
        <Dropdown.Item as="a" href="https://decentraland.org/account/" target="_blank" rel="noopener noreferrer">
          {t('page.profile.get_vp_dropdown.mana')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
