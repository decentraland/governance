import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage';
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import React from 'react';
import './ProposalNavigationItem.css'
import ProposalNavigationButton from './ProposalNavigationButton';

function truncate(str: string, limit?: number) {
  if(limit)
    return (str.length > limit) ? str.substring(0, limit-1) + "[...]" : str;

  return str
}

export type NavigationType = {
  id?: string
  title?: string
}

type NavigationItemProps = {
  type: 'prev' | 'next'
  side: 'left' | 'right'
  data?: NavigationType
  titleLimit?: number
}

function ProposalNavigationItem({type, side, data, titleLimit}: NavigationItemProps) {

  const l = useFormatMessage()

  if(data?.title && data.id) {
    return <>
    <Grid.Column className='NavArrow' style={{paddingLeft: 0}} verticalAlign='middle'>
      {type === 'prev' ?
        <ProposalNavigationButton direction={type} id={data.id!} /> :
        <></>
      }
    </Grid.Column>
    <Grid.Column className='NoPadding' mobile={5} computer={4} floated={side} textAlign={side}>
      <Header sub className='NoMargin'>{l(`navigation.proposal_nav.${type}`)!}</Header>
      <Header className='NoMargin Header__Title'>{truncate(data.title, titleLimit)}</Header>
    </Grid.Column>
    <Grid.Column className='NavArrow' style={{paddingRight: 0}} verticalAlign='middle'>
      {type === 'next' ?
        <ProposalNavigationButton direction={type} id={data.id!} /> :
        <></>
      }
    </Grid.Column>
  </>;
  }

  return <></>
}

export default React.memo(ProposalNavigationItem);
