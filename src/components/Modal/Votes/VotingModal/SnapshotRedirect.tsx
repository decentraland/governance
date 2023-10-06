import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../../../entities/Proposal/types'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import SnapshotRedirectButton from '../../../Common/SnapshotRedirectButton'
import Markdown from '../../../Common/Typography/Markdown'
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
        <Markdown componentsClassNames={{ p: 'SnapshotRedirect__Suggestion' }}>
          {t('page.proposal_detail.snapshot_redirect.suggestion')}
        </Markdown>
      </div>
      <div className="SnapshotRedirect__Actions">
        <SnapshotRedirectButton proposal={proposal} />
      </div>
    </Modal.Content>
  )
}
