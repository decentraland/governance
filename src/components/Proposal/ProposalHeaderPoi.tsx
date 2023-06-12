import React from 'react'

import ImgFixed from 'decentraland-gatsby/dist/components/Image/ImgFixed'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import Catalyst from 'decentraland-gatsby/dist/utils/api/Catalyst'
import Land from 'decentraland-gatsby/dist/utils/api/Land'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProposalAttributes } from '../../entities/Proposal/types'
import Pin from '../Icon/Pin'

import './ProposalHeaderPoi.css'

interface Props {
  configuration: ProposalAttributes['configuration']
}

export default function ProposalHeaderPoi({ configuration }: Props) {
  const { x, y } = configuration

  const [tile] = useAsyncMemo(() => Land.get().getTile([x, y]), [x, y])
  const [sceneImg] = useAsyncMemo(async () => {
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
  }, [x, y])

  if (!sceneImg) {
    return (
      <div className="ProposalHeaderPoi">
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
      </div>
    )
  }

  return (
    <div className="ProposalHeaderPoi">
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
    </div>
  )
}
