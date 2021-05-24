import React from 'react'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import ImgFixed from 'decentraland-gatsby/dist/components/Image/ImgFixed'
import Land from 'decentraland-gatsby/dist/utils/api/Land'
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { ProposalAttributes, ProposalType, NewProposalPOI } from '../../entities/Proposal/types'

import './ProposalHeader.css'
import JumpIn from '../Icon/JumpIn'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import Pin from '../Icon/Pin'

export type ProposalHeaderPoi = {
  proposal?: ProposalAttributes | null
}

export default React.memo(function ProposalHeaderPoi({ proposal }: ProposalHeaderPoi) {
  const [ tile, tileState ] = useAsyncMemo(async () => {
    if (proposal?.type !== ProposalType.POI) {
      return null
    }

    const configuration: NewProposalPOI = proposal!.configuration
    return Land.get().getTile([ configuration.x, configuration.y ])
  }, [ proposal ], { callWithTruthyDeps: true })

  if (proposal?.type !== ProposalType.POI) {
    return null
  }

  const configuration: NewProposalPOI = proposal.configuration
  return <div className="ProposalHeaderPoi">
    <ImgFixed dimension="wide" src={Land.get().getParcelImage([configuration.x, configuration.y])} />
    <Header size="medium">
      <Link href={`https://play.decentraland.org/?position=${configuration.x},${configuration.y}`}>
        {tile?.name}&nbsp;<JumpIn />
      </Link>
    </Header>
    <Link className="PoiLocation" href={`https://play.decentraland.org/?position=${configuration.x},${configuration.y}`}><Pin /> {`${configuration.x},${configuration.y}`}</Link>
  </div>
})