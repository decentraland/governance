import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProposalAttributes } from '../../../../entities/Proposal/types'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import SnapshotRedirectButton from '../../../Common/SnapshotRedirectButton'
import Markdown from '../../../Common/Typography/Markdown'

import './SidebarSnapshotRedirect.css'

interface Props {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
}

const SidebarSnapshotRedirect = ({ proposal }: Props) => {
  const t = useFormatMessage()
  return (
    <div className="SidebarSnapshotRedirect">
      <Header sub>{t('page.proposal_detail.snapshot_redirect.voting_not_available')}</Header>
      <Markdown
        className="SidebarSnapshotRedirect__Markdown"
        componentsClassNames={{
          p: 'SidebarSnapshotRedirect__Text',
          strong: 'SidebarSnapshotRedirect__StrongText',
        }}
      >
        {t('page.proposal_detail.snapshot_redirect.description')}
      </Markdown>
      <Markdown
        className="SidebarSnapshotRedirect__Markdown"
        componentsClassNames={{
          p: 'SidebarSnapshotRedirect__Text',
          strong: 'SidebarSnapshotRedirect__StrongText',
        }}
      >
        {t('page.proposal_detail.snapshot_redirect.suggestion')}
      </Markdown>
      <SnapshotRedirectButton proposal={proposal} inverted />
    </div>
  )
}

export default SidebarSnapshotRedirect
