import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'

import ProposalSubmitPoiPage from '../../components/Proposal/Submit/ProposalSubmitPoiPage'
import { toPoiType } from '../../entities/Proposal/types'
import useURLSearchParams from '../../hooks/useURLSearchParams'

import './submit.css'

export default function Poi() {
  const params = useURLSearchParams()
  const request = params.get('request')

  const poiType = toPoiType(request)

  if (poiType !== null) {
    return <ProposalSubmitPoiPage poiType={poiType} />
  }

  return <NotFound />
}
