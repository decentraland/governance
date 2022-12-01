import React from 'react'

import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProposalAttributes, ProposalType } from '../../../entities/Proposal/types'
import { UpdateAttributes } from '../../../entities/Updates/types'
import { isProposalStatusWithUpdates } from '../../../entities/Updates/utils'
import Divider from '../../Common/Divider'
import Megaphone from '../../Icon/Megaphone'

import ProposalUpdate from './ProposalUpdate'
import './ProposalUpdates.css'

interface Props {
  proposal: ProposalAttributes | null
  updates?: UpdateAttributes[] | null
  onUpdateDeleted: () => void
}

export default function ProposalUpdates({ proposal, updates, onUpdateDeleted }: Props) {
  const t = useFormatMessage()

  const showProposalUpdates =
    updates && isProposalStatusWithUpdates(proposal?.status) && proposal?.type === ProposalType.Grant

  if (!updates || !proposal || !showProposalUpdates) {
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
              onUpdateDeleted={onUpdateDeleted}
            />
          ))}
      </div>
    </div>
  )
}
