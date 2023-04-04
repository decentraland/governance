import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'

import ProposalSubmitHiringPage from '../../components/Proposal/Submit/ProposalSubmitHiringPage'
import { toHiringType } from '../../entities/Proposal/types'

import './submit.css'

export default function Hiring() {
  const location = useLocation()
  const param = new URLSearchParams(useMemo(() => new URLSearchParams(location.search), [location.search]))
  const request = param.get('request')

  const type = toHiringType(request)

  if (type !== null) {
    return <ProposalSubmitHiringPage type={type} />
  }

  return <NotFound />
}
