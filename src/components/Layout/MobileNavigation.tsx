import React, { useEffect, useState } from 'react'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import prevent from 'decentraland-gatsby/dist/utils/react/prevent'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import locations from '../../modules/locations'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { useLocation } from '@gatsbyjs/reach-router'
import { NavigationTab } from './Navigation'

import './MobileNavigation.css'

function MobileNavigation() {
  const t = useFormatMessage()
  const location = useLocation()
  const page = location.pathname.replaceAll('/', '')

  const selectedButton: any = {
    inverted: true,
    primary: true,
  }
  const unselectedButton: any = {
    secondary: true,
  }

  const [proposalsButtonProps, setProposalsButtonProps] = useState(selectedButton)
  const [transparencyButtonProps, setTransparencyButtonProps] = useState(unselectedButton)

  useEffect(() => {
    if (page === NavigationTab.Transparency) {
      setProposalsButtonProps(unselectedButton)
      setTransparencyButtonProps(selectedButton)
    } else {
      setProposalsButtonProps(selectedButton)
      setTransparencyButtonProps(unselectedButton)
    }
  }, [page])

  return (
    <>
      <Header sub className="Browse__header">
        {t(`page.proposal_list.browse`)}
      </Header>
      <div className={'Browse__Buttons'}>
        <Button
          className="Browse__Button"
          size="small"
          {...proposalsButtonProps}
          as={Link}
          href={locations.proposals()}
          onClick={prevent(() => {
            navigate(locations.proposals())
          })}
        >
          {t('navigation.proposals')}
        </Button>
        <Button
          className="Browse__Button"
          size="small"
          {...transparencyButtonProps}
          as={Link}
          href={locations.transparency()}
          onClick={prevent(() => {
            navigate(locations.transparency())
          })}
        >
          {t('navigation.transparency')}
        </Button>
      </div>
    </>
  )
}

export default React.memo(MobileNavigation)
