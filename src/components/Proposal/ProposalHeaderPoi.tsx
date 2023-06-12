import React from 'react'

import { useQuery } from '@tanstack/react-query'
import ImgFixed from 'decentraland-gatsby/dist/components/Image/ImgFixed'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import Catalyst from 'decentraland-gatsby/dist/utils/api/Catalyst'
import Land from 'decentraland-gatsby/dist/utils/api/Land'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { NewProposalPOI, ProposalAttributes, ProposalType } from '../../entities/Proposal/types'
import Pin from '../Icon/Pin'

import './ProposalHeader.css'

export type ProposalHeaderPoi = {
  proposal?: ProposalAttributes | null
}

export default React.memo(function ProposalHeaderPoi({ proposal }: ProposalHeaderPoi) {
  if (proposal?.type !== ProposalType.POI) {
    return null
  }

  const configuration: NewProposalPOI = proposal.configuration
  return (
    <div className="ProposalHeaderPoi">
      <ImgPOI x={configuration.x} y={configuration.y} />
    </div>
  )
})

const fetchSceneImg = async (x: number, y: number) => {
  const scenes = await Catalyst.get().getEntityScenes([[x, y]])
  const scene = scenes[0]
  if (!scene) {
    return null
  }

  let image = scene?.metadata?.display?.navmapThumbnail || ''
  if (image && !image.startsWith('https://')) {
    const list = scene.content || []
    const content = list.find((content) => content.file === image)
    if (content) {
      image = Catalyst.get().getContentUrl(content.hash)
    }
  }

  if (!image || !image.startsWith('https://')) {
    return null
  }

  return image
}

// eslint-disable-next-line react/display-name
const ImgPOI = React.memo(function ({ x, y }: { x: number; y: number }) {
  const { data: tile } = useQuery({
    queryKey: [`tile#${x},${y}`],
    queryFn: () => Land.get().getTile([x, y]),
    staleTime: 3.6e6, // 1 hour
  })
  const { data: sceneImg } = useQuery({
    queryKey: [`sceneImg#${x},${y}`],
    queryFn: () => fetchSceneImg(x, y),
    staleTime: 3.6e6, // 1 hour
  })

  if (!sceneImg) {
    return (
      <Link href={`https://play.decentraland.org/?position=${x},${y}`}>
        <div className="PoiImageContainer">
          <Header>{tile?.name || `Parcel ${x},${y}`}&nbsp;</Header>
          <div className="PoiPosition">
            <Pin />
            <span>
              {x},{y}
            </span>
          </div>
          <ImgFixed dimension="wide" size="initial" src={Land.get().getParcelImage([x, y])} />
        </div>
      </Link>
    )
  }

  return (
    <Link href={`https://play.decentraland.org/?position=${x},${y}`} className="Link--with-scene">
      <div className="PoiImageContainer">
        <Header>{tile?.name || `Parcel ${x},${y}`}&nbsp;</Header>
        <div className="PoiPosition">
          <Pin />
          <span>
            {x},{y}
          </span>
        </div>
        <ImgFixed dimension="standard" size="cover" src={sceneImg!} />
      </div>
      <div className="PoiImageContainer">
        <ImgFixed dimension="standard" size="initial" src={Land.get().getParcelImage([x, y])} />
      </div>
    </Link>
  )
})
