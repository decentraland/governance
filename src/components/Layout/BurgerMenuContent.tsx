import { useLocation } from '@reach/router'
import Link from "decentraland-gatsby/dist/components/Text/Link"
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import prevent from 'decentraland-gatsby/dist/utils/react/prevent'
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { navigate } from 'gatsby-plugin-intl'
import React, { useEffect, useMemo, useState } from 'react'
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import locations, { ProposalListView, toProposalListView } from '../../modules/locations'
import CategoryList from '../Category/CategoryList'
import './BurgerMenuContent.css'

function BurgerMenuContent() {
  const l = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [ location.search ])
  const view = toProposalListView(params.get('view')) ?? undefined

  const selectedButton: any = {
    inverted: true, 
    primary: true
  }
  const unselectedButton: any = {
    secondary: true
  }

  const [proposalsButtonProps, setProposalsButtonProps] = useState(selectedButton)
  const [enactedButtonProps, setEnactedButtonProps] = useState(unselectedButton)

  useEffect(() => {
    if(view === ProposalListView.Enacted) {
      setProposalsButtonProps(unselectedButton)
      setEnactedButtonProps(selectedButton)
    }
    else {
      setProposalsButtonProps(selectedButton)
      setEnactedButtonProps(unselectedButton)
    }
  }, [view])
  
  return <div>
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
            {...enactedButtonProps}
            as={Link}
            href={locations.proposals({ view: ProposalListView.Enacted })}
            onClick={prevent(() => {
              navigate(locations.proposals({ view: ProposalListView.Enacted }))
            })}
          >
            {l('navigation.enacted')}
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
    <CategoryList />
  </div>
}

export default React.memo(BurgerMenuContent)
