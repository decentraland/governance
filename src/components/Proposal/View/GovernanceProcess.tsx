import React, { useMemo } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ProposalType } from '../../../entities/Proposal/types'

import ProposalProcess, { ProcessStatus } from './ProposalProcess'

interface Props {
  proposalType: ProposalType
}

export default function GovernanceProcess({ proposalType }: Props) {
  const t = useFormatMessage()

  const items = useMemo(
    () => [
      {
        title: t('page.proposal_governance_process.poll_title'),
        description: t('page.proposal_governance_process.poll_description'),
        status: proposalType === ProposalType.Poll ? ProcessStatus.Active : ProcessStatus.Default,
      },
      {
        title: t('page.proposal_governance_process.draft_title'),
        description: t('page.proposal_governance_process.draft_description'),
        status: proposalType === ProposalType.Draft ? ProcessStatus.Active : ProcessStatus.Default,
      },
      {
        title: t('page.proposal_governance_process.governance_title'),
        description: t('page.proposal_governance_process.governance_description'),
        status: proposalType === ProposalType.Governance ? ProcessStatus.Active : ProcessStatus.Default,
      },
    ],
    [proposalType, t]
  )

  return <ProposalProcess title={t('page.proposal_governance_process.title')} items={items} />
}
