import React from 'react'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { ProposalAttributes, ProposalType, NewProposalPOI } from '../../entities/Proposal/types'

import JumpIn from '../Icon/JumpIn'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import './ProposalFooter.css'

export type ProposalHeaderPoi = {
  proposal?: ProposalAttributes | null
}

export default React.memo(function ProposalHeaderPoi({ proposal }: ProposalHeaderPoi) {
  const t = useFormatMessage()
  if (proposal?.type !== ProposalType.POI) {
    return null
  }

  const configuration: NewProposalPOI = proposal.configuration
  return (
    <div className="ProposalFooter ProposalFooterPoi">
      <Button primary as={Link} href={`https://play.decentraland.org/?position=${configuration.x},${configuration.y}`}>
        {t('general.jump_in')}
        <JumpIn width="17" height="17" style={{ marginLeft: '1rem' }} />
      </Button>
    </div>
  )
})
