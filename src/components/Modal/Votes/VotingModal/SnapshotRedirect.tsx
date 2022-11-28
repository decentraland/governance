import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../../../entities/Proposal/types'
import SnapshotRedirectButton from '../../../Common/SnapshotRedirectButton'
import VotingDisabled from '../../../Icon/VotingDisabled'
import '../../ProposalModal.css'

import './SnapshotRedirect.css'
import './VotingModal.css'

interface Props {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
}

export function SnapshotRedirect({ proposal }: Props) {
  const t = useFormatMessage()
  return (
    <Modal.Content>
      <div className="SnapshotRedirect__Content">
        <VotingDisabled className="SnapshotRedirect__Icon" />
        <span className="SnapshotRedirect__Header">
          {t('page.proposal_detail.snapshot_redirect.voting_not_available')}
        </span>
        <div className="SnapshotRedirect__Description">{t('page.proposal_detail.snapshot_redirect.description')}</div>
        <Markdown className="SnapshotRedirect__Suggestion">
          {t('page.proposal_detail.snapshot_redirect.suggestion')}
        </Markdown>
      </div>
      <div className="SnapshotRedirect__Actions">
        <SnapshotRedirectButton proposal={proposal} />
      </div>
    </Modal.Content>
  )
}
