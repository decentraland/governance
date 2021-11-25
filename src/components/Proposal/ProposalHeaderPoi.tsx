import React from 'react'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import ImgFixed from 'decentraland-gatsby/dist/components/Image/ImgFixed'
import Land from 'decentraland-gatsby/dist/utils/api/Land'
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { ProposalAttributes, ProposalType, NewProposalPOI } from '../../entities/Proposal/types'

import Pin from '../Icon/Pin'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import Catalyst from 'decentraland-gatsby/dist/utils/api/Catalyst'
import './ProposalHeader.css'

export type ProposalHeaderPoi = {
  proposal?: ProposalAttributes | null
}

export default React.memo(function ProposalHeaderPoi({ proposal }: ProposalHeaderPoi) {
  if (proposal?.type !== ProposalType.POI) {
    return null
  }

  const configuration: NewProposalPOI = proposal.configuration
  return <div className="ProposalHeaderPoi">
    <ImgPOI x={configuration.x} y={configuration.y} />
  </div>
})

const ImgPOI = React.memo(function ({ x, y }: { x: number, y: number }) {
  const [ tile, tileState ] = useAsyncMemo(() => Land.get().getTile([x, y]), [x, y])
  const [ sceneImg, sceneImgState ] = useAsyncMemo(async () => {
    const scenes = await Catalyst.get().getEntityScenes([ [x, y] ])
    const scene = scenes[0]
    if (!scene) {
      return null
    }

    let image = scene?.metadata?.display?.navmapThumbnail || ''
    if (image && !image.startsWith('https://')) {
      const list = scene.content || []
      const content = list.find(content => content.file === image)
      if (content) {
        image = Catalyst.get().getContentUrl(content.hash)
      }
    }

    if (!image || !image.startsWith('https://')) {
      return null
    }

    return image
  }, [x, y])

  if (!sceneImg) {
    return <Link href={`https://play.decentraland.org/?position=${x},${y}`} >
    <div className="PoiImageContainer">
      <Header>{tile?.name || `Parcel ${x},${y}`}&nbsp;</Header>
      <div className="PoiPosition">
        <Pin />
        <span>{x},{y}</span>
      </div>
      <ImgFixed dimension="wide" size="initial" src={Land.get().getParcelImage([x, y])} />
    </div>
  </Link>
  }

  return <Link href={`https://play.decentraland.org/?position=${x},${y}`} className="Link--with-scene">
    <div className="PoiImageContainer">
      <Header>{tile?.name || `Parcel ${x},${y}`}&nbsp;</Header>
      <div className="PoiPosition">
        <Pin />
        <span>{x},{y}</span>
      </div>
      <ImgFixed dimension="standard" size="cover" src={sceneImg!} />
    </div>
    <div className="PoiImageContainer">
      <ImgFixed dimension="standard" size="initial" src={Land.get().getParcelImage([x, y])} />
    </div>
  </Link>
})
