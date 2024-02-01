import { ProposalAttributes } from '../../../entities/Proposal/types'
import { UpdateAttributes } from '../../../entities/Updates/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Empty from '../../Common/Empty'
import Megaphone from '../../Icon/Megaphone'
import Section from '../View/Section'

import ProposalUpdate from './ProposalUpdate'
import './ProposalUpdates.css'

interface Props {
  proposal: ProposalAttributes | null
  updates?: UpdateAttributes[] | null
  isCoauthor: boolean
  onUpdateDeleted: () => void
}

export default function ProposalUpdates({ proposal, updates, isCoauthor, onUpdateDeleted }: Props) {
  const t = useFormatMessage()

  if (!updates || !proposal) {
    return null
  }

  const hasUpdates = updates.length > 0

  return (
    <Section title={t('page.proposal_detail.grant.update_title')}>
      {!hasUpdates && (
        <Empty
          className="ProposalUpdates__EmptyContainer"
          icon={<Megaphone className="ProposalUpdates__EmptyIcon" />}
          description={t('page.proposal_detail.grant.update_empty')}
        />
      )}
      {hasUpdates &&
        updates.map((item, index) => (
          <ProposalUpdate
            key={item.id}
            index={updates.length - index}
            proposal={proposal}
            update={item}
            expanded={index === 0}
            isCoauthor={isCoauthor}
            onUpdateDeleted={onUpdateDeleted}
          />
        ))}
    </Section>
  )
}
