import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { snapshotProposalUrl } from '../../../entities/Proposal/utils'
import SnapshotRedirectButton from '../../Common/SnapshotRedirectButton'
import OpenExternalLink from '../../Icon/OpenExternalLink'

import './SidebarSnapshotRedirect.css'

interface Props {
  proposal: Pick<ProposalAttributes, 'snapshot_id' | 'snapshot_space'>
}

const SidebarSnapshotRedirect = ({ proposal }: Props) => {
  return (
    <div className="SidebarSnapshotRedirect">
      <Header sub>{'Voting not available'}</Header>
      <Markdown className="SidebarSnapshotRedirect__Text">
        {"**It looks like we're having issues casting your vote from the Governance dApp.**"}
      </Markdown>
      <Markdown className="SidebarSnapshotRedirect__Text">
        {'You can try voting directly on **Snapshot** - the system we use for decision-making.'}
      </Markdown>
      <SnapshotRedirectButton proposal={proposal} inverted />
    </div>
  )
}

export default SidebarSnapshotRedirect
