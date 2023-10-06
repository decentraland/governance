import { useCallback } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { UpdateAttributes, UpdateStatus } from '../../../entities/Updates/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'
import locations, { navigate } from '../../../utils/locations'
import DateTooltip from '../../Common/DateTooltip'
import Markdown from '../../Common/Typography/Markdown'
import Helper from '../../Helper/Helper'

import './ProposalUpdatesActions.css'

type ProposalUpdatesActionsProps = {
  nextUpdate?: UpdateAttributes | null
  currentUpdate?: UpdateAttributes | null
  pendingUpdates?: UpdateAttributes[]
  proposal: ProposalAttributes
}

export default function ProposalUpdatesActions({ nextUpdate, currentUpdate, proposal }: ProposalUpdatesActionsProps) {
  const t = useFormatMessage()
  const hasSubmittedUpdate = !!currentUpdate?.completion_date

  const onPostUpdateClick = useCallback(() => {
    const hasPendingUpdates = currentUpdate?.id && currentUpdate?.status === UpdateStatus.Pending
    navigate(
      locations.submitUpdate({
        ...(hasPendingUpdates && { id: currentUpdate?.id }),
        proposalId: proposal.id,
      })
    )
  }, [currentUpdate?.id, currentUpdate?.status, proposal])

  return (
    <div className="DetailsSection">
      <div className="DetailsSection__Content">
        <Markdown
          className="ProposalUpdatesActions__UpdateDescription"
          componentsClassNames={{ strong: 'ProposalUpdatesActions__UpdateDescriptionBold' }}
        >
          {t('page.proposal_detail.grant.update_description')}
        </Markdown>
        <Button
          disabled={hasSubmittedUpdate}
          onClick={onPostUpdateClick}
          className="ProposalUpdatesActions__UpdateButton"
          primary
        >
          {t('page.proposal_detail.grant.update_button')}
        </Button>
        {!hasSubmittedUpdate && nextUpdate?.due_date && currentUpdate?.due_date && (
          <span className="ProposalUpdatesActions__DueDate">
            <DateTooltip date={currentUpdate.due_date}>
              <Markdown size="sm">
                {t('page.proposal_detail.grant.current_update_due_date', {
                  date: Time(currentUpdate.due_date).fromNow(true),
                })}
              </Markdown>
            </DateTooltip>
            <Helper
              text={t('page.proposal_detail.grant.current_update_info')}
              position="bottom right"
              size="14"
              containerClassName="ProposalUpdatesActions__InfoIconContainer"
            />
          </span>
        )}
        {hasSubmittedUpdate && nextUpdate?.due_date && currentUpdate?.due_date && (
          <span className="ProposalUpdatesActions__DueDate">
            <DateTooltip date={nextUpdate.due_date}>
              <Markdown size="sm">
                {t('page.proposal_detail.grant.next_update_due_date', {
                  date: Time(nextUpdate.due_date).fromNow(true),
                })}
              </Markdown>
            </DateTooltip>
          </span>
        )}
      </div>
    </div>
  )
}
