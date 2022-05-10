import React from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import { UpdateAttributes } from '../../entities/Updates/types'
import { ProposalAttributes } from '../../entities/Proposal/types'
import Divider from '../Section/Divider'
import ProposalUpdate from './ProposalUpdate'
import Megaphone from '../Icon/Megaphone'
import './ProposalUpdates.css'

export default function ProposalUpdates({
  proposal,
  updates,
  onUpdateClick,
}: {
  proposal: ProposalAttributes | null
  updates?: UpdateAttributes[] | null
  onUpdateClick: (update: UpdateAttributes) => void
}) {
  const t = useFormatMessage()

  if (!updates || !proposal) {
    return null
  }

  const hasUpdates = updates.length > 0

  return (
    <div className="ProposalUpdates">
      <Divider />
      <div className="ProposalUpdates__Header">
        <Header>{t('page.proposal_detail.grant.update_title')}</Header>
      </div>
      <div>
        {!hasUpdates && (
          <div className="ProposalUpdates__EmptyContainer">
            <Megaphone className="ProposalUpdates__EmptyIcon" />
            <Paragraph secondary className="ProposalUpdates__EmptyText">
              {t('page.proposal_detail.grant.update_empty')}
            </Paragraph>
          </div>
        )}
        {hasUpdates &&
          updates.map((item, index) => (
            <ProposalUpdate
              key={item.id}
              index={updates.length - index}
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
