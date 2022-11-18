import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import SnapshotRedirectButton from '../../Common/SnapshotRedirectButton'

import './SidebarSnapshotRedirect.css'

interface Props {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
}

const SidebarSnapshotRedirect = ({ proposal }: Props) => {
  const t = useFormatMessage()
  return (
    <div className="SidebarSnapshotRedirect">
      <Header sub>{t('page.proposal_detail.snapshot_redirect.voting_not_available')}</Header>
      <Markdown className="SidebarSnapshotRedirect__Text">
        {t('page.proposal_detail.snapshot_redirect.description')}
      </Markdown>
      <Markdown className="SidebarSnapshotRedirect__Text">
        {t('page.proposal_detail.snapshot_redirect.suggestion')}
      </Markdown>
      <SnapshotRedirectButton proposal={proposal} inverted />
    </div>
  )
}

export default SidebarSnapshotRedirect
