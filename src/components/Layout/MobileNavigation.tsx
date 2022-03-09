import React, { useEffect, useMemo, useState } from 'react'
import Link from "decentraland-gatsby/dist/components/Text/Link"
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import prevent from 'decentraland-gatsby/dist/utils/react/prevent'
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { navigate } from 'gatsby-plugin-intl'
import locations from '../../modules/locations'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { useLocation } from '@reach/router'
import { NavigationTab } from './Navigation'

import './MobileNavigation.css'

function MobileNavigation() {
  const l = useFormatMessage()
  const location = useLocation()
  const page = location.pathname.replaceAll('/', '')


  const selectedButton: any = {
    inverted: true, 
    primary: true
  }
  const unselectedButton: any = {
    secondary: true
  }

  const [proposalsButtonProps, setProposalsButtonProps] = useState(selectedButton)
  const [transparencyButtonProps, setTransparencyButtonProps] = useState(unselectedButton)

  useEffect(() => {
    if(page === NavigationTab.Transparency) {
      setProposalsButtonProps(unselectedButton)
      setTransparencyButtonProps(selectedButton)
    }
    else {
      setProposalsButtonProps(selectedButton)
      setTransparencyButtonProps(unselectedButton)
    }
  }, [page])

  return <>
    <Header sub>{l(`page.proposal_list.browse`)}</Header>
    <Grid textAlign='center' className='Browse'>
      <Grid.Row columns={2}>
        <Grid.Column>
          <Button
            className='Browse__Button' 
            size="small" 
            {...proposalsButtonProps}
            as={Link}
            href={locations.proposals()}
            onClick={prevent(() => {
              navigate(locations.proposals())
            })}
          >
            {l('navigation.proposals')}
          </Button>
        </Grid.Column>
        <Grid.Column>
          <Button
            className='Browse__Button' 
            size="small" 
            {...transparencyButtonProps}
            as={Link}
            href={locations.transparency()}
            onClick={prevent(() => {
              navigate(locations.transparency())
            })}
          >
            {l('navigation.transparency')}
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </>
}

export default React.memo(MobileNavigation)