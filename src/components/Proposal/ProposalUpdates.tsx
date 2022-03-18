import React, { useMemo } from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { UpdateAttributes, UpdateStatus } from '../../entities/Updates/types'

import Divider from '../Section/Divider'
import ProposalUpdate from './ProposalUpdate'
import './ProposalUpdates.css'
import { ProposalAttributes } from '../../entities/Proposal/types'

export default function ProposalUpdates({
  proposal,
  updates,
  onUpdateClick,
}: {
  proposal: ProposalAttributes
  updates?: UpdateAttributes[] | null
  onUpdateClick: (update: UpdateAttributes) => void
}) {
  const l = useFormatMessage()
  const now = Date.now()

  if (!updates || (updates && updates.length === 0)) {
    return null // TODO: Add empty state
  }

  return (
    <div className="ProposalUpdates">
      <Divider />
      <div className="ProposalUpdates__Header">
        <Header>{l('page.proposal_detail.grant.update_title')}</Header>
      </div>
      <div>
        {updates &&
          updates.map((item, index) => (
            <ProposalUpdate
              key={item.id}
              proposal={proposal}
              update={item}
              expanded={index === 0}
              onClick={onUpdateClick}
            />
          ))}
      </div>
    </div>
  )
}
