import React, {useContext, useState, useEffect} from 'react';
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import ProposalNavigationItem, {NavigationType} from './ProposalNavigationItem';
import { UrlParamsContext } from '../Context/UrlParamsContext';
import useProposals from '../../hooks/useProposals';
import './ProposalNavigation.css';

export type ProposalNavigationProps = {
  id: string
}

function ProposalNavigation({id}: ProposalNavigationProps) {

  const context = useContext(UrlParamsContext)
  const [prevPage, setPrevPage] = useState({} as NavigationType);
  const [nextPage, setNextPage] = useState({} as NavigationType);
  let params: any = {}
  
  if(context?.urlParams) {
    const p = new URLSearchParams(context.urlParams.params)

    for (const key of p.keys()) {
      params[key] = p.get(key)
    }

    params = {...params, itemsPerPage: context.urlParams.itemsPerPage}
  }

  console.log(params)

  const [proposals, proposalsState ] = useProposals(params)

  const idx = proposals?.data.map(p => p['id']).indexOf(id)

  console.log(idx)

  useEffect(() => {
    if(Number.isInteger(idx)) {

      if(idx > 0) {
        const prev: NavigationType = {
          id: proposals!.data[idx-1].id,
          title: proposals!.data[idx-1].title
        }
  
        setPrevPage(prev)
      }
      else {
        setPrevPage({})
      }
  
      if(idx >= 0 && idx < proposals!.data.length-1) {
        const next: NavigationType = {
          id: proposals!.data[idx+1].id,
          title: proposals!.data[idx+1].title
        }
  
        setNextPage(next)
      }
      else {
        setNextPage({})
      }
    }
  }, [idx]);

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
