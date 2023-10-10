import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'

import ProposalSubmitCatalystPage from '../../components/Proposal/Submit/ProposalSubmitCatalystPage'
import { toCatalystType } from '../../entities/Proposal/types'
import useURLSearchParams from '../../hooks/useURLSearchParams'

import './submit.css'

export default function CatalystPage() {
  const params = useURLSearchParams()
  const request = params.get('request')

  const catalystType = toCatalystType(request)

  if (catalystType !== null) {
    return <ProposalSubmitCatalystPage catalystType={catalystType} />
  }

  return <NotFound />
}
