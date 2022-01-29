import React from 'react';
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import { Back } from "decentraland-ui/dist/components/Back/Back"
import ProposalNavigationItem from './ProposalNavigationItem';
import './ProposalNavigation.css'

function ProposalNavigation() {
  return <div className='ProposalNavigation'>
    <Grid id='nav' verticalAlign='middle'>
      <Grid.Row columns={4}>
        <Grid.Column className='NavArrow'>
          <Back onClick={() => ''} />
        </Grid.Column>
        <ProposalNavigationItem type='prev' side='left' titleLimit={96} title='Add the location 23,23 to the Points of Interest'/>
        <ProposalNavigationItem type='next' side='right' titleLimit={96} title='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc suscipit, lorem at scelerisque iaculis, libero odio pretium sem, at euismod mi ante sit amet justo. Morbi est risus, venenatis vitae amet.'/>
        <Grid.Column textAlign='right' className='NavArrow'>
          <div style={{transform: "rotate(180deg)"}}>
            <Back onClick={() => ''}/>
          </div>
        </Grid.Column>
      </Grid.Row>
    </Grid>
    </div>;
}

export default React.memo(ProposalNavigation);
