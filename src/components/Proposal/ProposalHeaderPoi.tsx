import { useQuery } from '@tanstack/react-query'
import Catalyst from 'decentraland-gatsby/dist/utils/api/Catalyst'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { DEFAULT_QUERY_STALE_TIME } from '../../hooks/constants'
import { getParcelImageUrl, getTile } from '../../utils/Land'
import Link from '../Common/Typography/Link'
import Pin from '../Icon/Pin'

import './ProposalHeaderPoi.css'
import ProposalHeaderPoiImage from './ProposalHeaderPoiImage'

interface Props {
  configuration: ProposalAttributes['configuration']
}

const fetchSceneImg = async (x: number, y: number) => {
  const scenes = await Catalyst.getInstance().getEntityScenes([[x, y]])
  const scene = scenes[0]
  if (!scene) {
    return null
  }

  let image = scene?.metadata?.display?.navmapThumbnail || ''
  if (image && !image.startsWith('https://')) {
    const list = scene.content || []
    const content = list.find((content) => content.file === image)
    if (content) {
      image = Catalyst.getInstance().getContentUrl(content.hash)
    }
  }

  if (!image || !image.startsWith('https://')) {
    return null
  }

  return image
}

export default function ProposalHeaderPoi({ configuration }: Props) {
  const { x, y } = configuration

  const { data: tile } = useQuery({
    queryKey: [`tile#${x},${y}`],
    queryFn: () => getTile([x, y]),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  const { data: sceneImg } = useQuery({
    queryKey: [`sceneImg#${x},${y}`],
    queryFn: () => fetchSceneImg(x, y),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  })

  if (!sceneImg) {
    return (
      <div className="ProposalHeaderPoi">
        <Link href={`https://play.decentraland.org/?position=${x},${y}`}>
          <div className="ProposalHeaderPoi__ImageContainer">
            <Header>{tile?.name || `Parcel ${x},${y}`}&nbsp;</Header>
            <div className="ProposalHeaderPoi__PoiPosition">
              <Pin />
              <span>
                {x},{y}
              </span>
            </div>
            <ProposalHeaderPoiImage dimension="wide" size="initial" src={getParcelImageUrl([x, y])} />
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div className="ProposalHeaderPoi">
      <Link href={`https://play.decentraland.org/?position=${x},${y}`} className="Link--with-scene">
        <div className="ProposalHeaderPoi__ImageContainer">
          <Header>{tile?.name || `Parcel ${x},${y}`}&nbsp;</Header>
          <div className="ProposalHeaderPoi__PoiPosition">
            <Pin />
            <span>
              {x},{y}
            </span>
          </div>
          <ProposalHeaderPoiImage dimension="standard" size="cover" src={sceneImg} />
        </div>
        <div className="ProposalHeaderPoi__ImageContainer">
          <ProposalHeaderPoiImage dimension="standard" size="initial" src={getParcelImageUrl([x, y])} />
        </div>
      </Link>
    </div>
  )
}
