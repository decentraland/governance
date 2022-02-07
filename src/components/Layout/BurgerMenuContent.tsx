import React, {useState, useEffect} from 'react'
import CategoryList from '../Category/CategoryList'
import { Header } from "decentraland-ui/dist/components/Header/Header"
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import { Button } from "decentraland-ui/dist/components/Button/Button"
import Link from "decentraland-gatsby/dist/components/Text/Link"
import './BurgerMenuContent.css'
import locations, { ProposalListView } from '../../modules/locations'
import prevent from 'decentraland-gatsby/dist/utils/react/prevent'
import { navigate } from 'gatsby-plugin-intl'

function BurgerMenuContent() {
  const l = useFormatMessage()

  const primaryButton: any = {
    inverted: true, 
    primary: true
  }
  const secondaryButton: any = {
    secondary: true
  }

  const [proposals, setProposals] = useState(true);
  const [proposalsButtonProps, setProposalsButtonProps] = useState(primaryButton)
  const [enactedButtonProps, setEnactedButtonProps] = useState(secondaryButton)

  useEffect(() => {
    if(proposals) {
      setProposalsButtonProps(primaryButton)
      setEnactedButtonProps(secondaryButton)
    }
    else {
      setProposalsButtonProps(secondaryButton)
      setEnactedButtonProps(primaryButton)
    }
  }, [proposals])
  
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
              setProposals(true)
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
              setProposals(false)
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
