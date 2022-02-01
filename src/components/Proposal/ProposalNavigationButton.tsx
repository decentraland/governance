import React from 'react';
import { navigate } from 'gatsby';
import locations from '../../modules/locations';
import { Back } from "decentraland-ui/dist/components/Back/Back"
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"

type NavButtonProps = {
  direction: 'prev' | 'next'
  id: string
}

function ProposalNavigationButton({direction, id}: NavButtonProps) {
  const style: any = {}

  if(direction === 'next') {
    style['transform'] = "rotate(180deg)"
  }

  return <div style={style}>
    <Back onClick={() => navigate(locations.proposal(id))} />
  </div>
}

export default React.memo(ProposalNavigationButton);
