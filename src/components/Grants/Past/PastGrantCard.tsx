import React, { useCallback } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { TransparencyGrant } from '../../../entities/Proposal/types'
import locations from '../../../modules/locations'
import GrantPill from '../GrantPill'

import './PastGrantCard.css'

interface Props {
  grant: TransparencyGrant
}

const PastGrantCard = ({ grant }: Props) => {
  const t = useFormatMessage()
  const { id, title, configuration, enacted_at, size } = grant
  const handleClick = useCallback(() => navigate(locations.proposal(id)), [id])

  return (
    <div onClick={handleClick} className="PastGrantCard">
      <div>
        <div className="PastGrantCard__Header">
          <div className="PastGrantCard__TierSize">
            <div className="PastGrantCard__TierSize">
              <p className="PastGrantCard__Size">{`$${size} USD`}</p>
            </div>
          </div>
          <GrantPill type={configuration.category} />
        </div>
        <Header className="PastGrantCard__Title">{title}</Header>
        <div className="PastGrantCard__Dates">
          <span>{t('page.grants.started_date')}</span>
          <span className="PastGrantCard__StartedDate">
            {enacted_at ? Time.unix(enacted_at).format('MMMM DD, YYYY') : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PastGrantCard
