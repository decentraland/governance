import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage';
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import React from 'react';
import './ProposalNavigationItem.css'

function truncate(str: string, limit?: number) {
  if(limit)
    return (str.length > limit) ? str.substring(0, limit-1) + "[...]" : str;

  return str
}

type NavigationItemProps = {
  type: 'prev' | 'next'
  side: 'left' | 'right'
  title: string
  titleLimit?: number
}

function ProposalNavigationItem({type, side, title, titleLimit}: NavigationItemProps) {

  const l = useFormatMessage()

  return <>
    <Grid.Column className='NoPadding' mobile={5} computer={4} floated={side} textAlign={side}>
      <Header sub className='NoMargin'>{l(`navigation.proposal_nav.${type}`)!}</Header>
      <Header className='NoMargin Header__Title'>{truncate(title, titleLimit)}</Header>
    </Grid.Column>
  </>;
}

export default React.memo(ProposalNavigationItem);
