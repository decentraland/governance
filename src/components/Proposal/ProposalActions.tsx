import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { ProposalStatus } from '../../entities/Proposal/types'
import { ProposalPageOptions } from '../../pages/proposal'

type ProposalActionsProps = {
  isOwner: boolean
  isCommittee: boolean
  deleting: boolean
  updatingStatus: boolean
  proposal: ProposalAttributes | null
  patchOptions: (newState: Partial<ProposalPageOptions>) => void
}

export default function ProposalActions({
  proposal,
  isOwner,
  isCommittee,
  deleting,
  updatingStatus,
  patchOptions,
}: ProposalActionsProps) {
  const t = useFormatMessage()

  return (
    <>
      {(isOwner || isCommittee) && (
        <Button
          basic
          fluid
          loading={deleting}
          disabled={proposal?.status !== ProposalStatus.Pending && proposal?.status !== ProposalStatus.Active}
          onClick={() => patchOptions({ confirmDeletion: true })}
        >
          {t('page.proposal_detail.delete')}
        </Button>
      )}
      {isCommittee && (proposal?.status === ProposalStatus.Passed || proposal?.status === ProposalStatus.Enacted) && (
        <Button
          basic
          loading={updatingStatus}
          fluid
          onClick={() =>
            patchOptions({
              confirmStatusUpdate: ProposalStatus.Enacted,
            })
          }
        >
          {t(
            proposal?.status === ProposalStatus.Passed
              ? 'page.proposal_detail.enact'
              : 'page.proposal_detail.edit_enacted_data'
          )}
        </Button>
      )}
      {isCommittee && proposal?.status === ProposalStatus.Finished && (
        <>
          <Button
            basic
            loading={updatingStatus}
            fluid
            onClick={() => patchOptions({ confirmStatusUpdate: ProposalStatus.Passed })}
          >
            {t('page.proposal_detail.pass')}
          </Button>
          <Button
            basic
            loading={updatingStatus}
            fluid
            onClick={() =>
              patchOptions({
                confirmStatusUpdate: ProposalStatus.Rejected,
              })
            }
          >
            {t('page.proposal_detail.reject')}
          </Button>
        </>
      )}
    </>
  )
}
