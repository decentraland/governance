import React, {useContext} from 'react';
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import { Back } from "decentraland-ui/dist/components/Back/Back"
import ProposalNavigationItem from './ProposalNavigationItem';
import './ProposalNavigation.css'
import { UrlParamsContext } from '../Context/UrlParamsContext';
import useProposals from '../../hooks/useProposals';

function ProposalNavigation() {


  const context = useContext(UrlParamsContext)
  // console.log(JSON.parse('{"' + decodeURI(context?.params ? context?.params.params : '').replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}'))
  if(context?.params) {
    const p = new URLSearchParams(context.params.params)
    let params: any = {}

    // iterate over all keys
    for (const key of p.keys()) {
      params[key] = p.get(key)
    }

    params = {...params, itemsPerPage: context.params.itemsPerPage}
    console.log(params)
    const [ proposals, proposalsState ] = useProposals(params)
    console.log(proposals)
  }


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
