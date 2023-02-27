import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl/utils'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalType } from '../../entities/Proposal/types'
import locations from '../../modules/locations'

import './RequestBanner.css'

function RequestBanner() {
  const t = useFormatMessage()
  return (
    <div className="RequestBanner">
      <div className="RequestBanner__Title">{t('page.grants.request_banner.title')}</div>
      <div className="RequestBanner__Description">{t('page.grants.request_banner.description')}</div>
      <Button fluid className="RequestBanner__Button" onClick={() => navigate(locations.submit(ProposalType.Grant))}>
        {t('page.grants.request_banner.button')}
      </Button>
    </div>
  )
}

export default RequestBanner
