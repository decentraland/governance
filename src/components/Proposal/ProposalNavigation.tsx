import React, {useContext, useState, useEffect, useMemo} from 'react';
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import ProposalNavigationItem, {NavigationType} from './ProposalNavigationItem';
import { UrlParamsContext } from '../Context/UrlParamsContext';
import useProposals from '../../hooks/useProposals';
import { useLocation } from '@reach/router'
import './ProposalNavigation.css';

function ProposalNavigation() {

  const location = useLocation()
  const urlParams = useMemo(() => new URLSearchParams(location.search), [ location.search ])
  const id = urlParams.get('id')

  const context = useContext(UrlParamsContext)
  const [prevPage, setPrevPage] = useState({} as NavigationType)
  const [nextPage, setNextPage] = useState({} as NavigationType)
  const [params, setParams] = useState({} as any);

  let filters: any = {}

  if(context?.params) {
    filters = {...context.params}
    delete filters['page']
  }
  
  const [proposals, proposalsState] = useProposals(params)

  useEffect(() => {
    setParams({id: id!, ...filters})
    proposalsState.reload()
  }, [id]);

  useEffect(() => {
    if(proposals?.ok) {
      const idx = proposals.data.map(p => p['id']).indexOf(id!)
      if(idx > 0) {
        const prev: NavigationType = {
          id: proposals.data[idx-1].id,
          title: proposals.data[idx-1].title
        }
  
        setPrevPage(prev)
      }
      else {
        setPrevPage({})
      }
  
      if(idx >= 0 && idx < proposals.data.length-1) {
        const next: NavigationType = {
          id: proposals.data[idx+1].id,
          title: proposals.data[idx+1].title
        }
  
        setNextPage(next)
      }
      else {
        setNextPage({})
      }
    }
  }, [proposals]);

  return <div className='ProposalNavigation'>
    <Grid id='nav' verticalAlign='middle'>
      <Grid.Row columns={4}>
        <ProposalNavigationItem type='prev' side='left' titleLimit={96} data={prevPage}/>
        <ProposalNavigationItem type='next' side='right' titleLimit={96} data={nextPage}/>
      </Grid.Row>
    </Grid>
    </div>
}

export default React.memo(ProposalNavigation);
