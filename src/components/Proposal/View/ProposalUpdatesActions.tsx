import { useCallback, useMemo, useState } from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { ProposalAttributes } from '../../../entities/Proposal/types'
import { UpdateAttributes, UpdateStatus } from '../../../entities/Updates/types'
import { isBetweenLateThresholdDate } from '../../../entities/Updates/utils'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'
import locations, { navigate } from '../../../utils/locations'
import DateTooltip from '../../Common/DateTooltip'
import Markdown from '../../Common/Typography/Markdown'
import Helper from '../../Helper/Helper'
import ConfirmationModal from '../../Modal/ConfirmationModal'

import './ProposalUpdatesActions.css'

type ProposalUpdatesActionsProps = {
  nextUpdate?: UpdateAttributes | null
  currentUpdate?: UpdateAttributes | null
  pendingUpdates?: UpdateAttributes[]
  proposal: ProposalAttributes
}

export default function ProposalUpdatesActions({
  nextUpdate,
  currentUpdate,
  proposal,
  pendingUpdates,
}: ProposalUpdatesActionsProps) {
  const t = useFormatMessage()
  const hasSubmittedUpdate = !!currentUpdate?.completion_date
  const [isLateUpdateModalOpen, setIsLateUpdateModalOpen] = useState(false)
  const latePendingUpdate = useMemo(
    () =>
      pendingUpdates?.find(
        (update) =>
          update.id !== nextUpdate?.id && Time().isAfter(update.due_date) && isBetweenLateThresholdDate(update.due_date)
      ),
    [nextUpdate?.id, pendingUpdates]
  )

  const navigateToNextUpdateSubmit = useCallback(() => {
    const hasUpcomingPendingUpdate = currentUpdate?.id && currentUpdate?.status === UpdateStatus.Pending
    navigate(
      locations.submitUpdate({
        ...(hasUpcomingPendingUpdate && { id: currentUpdate?.id }),
        proposalId: proposal.id,
      })
    )
  }, [currentUpdate?.id, currentUpdate?.status, proposal.id])

  const onPostUpdateClick = useCallback(() => {
    if (latePendingUpdate) {
      setIsLateUpdateModalOpen(true)

      return
    }

    navigateToNextUpdateSubmit()
  }, [latePendingUpdate, navigateToNextUpdateSubmit])

  const handlePendingModalPrimaryClick = () => {
    navigate(
      locations.submitUpdate({
        id: latePendingUpdate?.id,
        proposalId: proposal.id,
      })
    )
  }

  const handlePendingModalSecondaryClick = () => {
    navigateToNextUpdateSubmit()
  }

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
      <ConfirmationModal
        isOpen={isLateUpdateModalOpen}
        onPrimaryClick={handlePendingModalPrimaryClick}
        onSecondaryClick={handlePendingModalSecondaryClick}
        onClose={() => setIsLateUpdateModalOpen(false)}
        title={t('page.proposal_detail.grant.pending_update_modal.title')}
        description={
          nextUpdate
            ? t('page.proposal_detail.grant.pending_update_modal.description')
            : t('page.proposal_detail.grant.pending_update_modal.description_last')
        }
        primaryButtonText={t('page.proposal_detail.grant.pending_update_modal.primary_button')}
        secondaryButtonText={
          nextUpdate
            ? t('page.proposal_detail.grant.pending_update_modal.secondary_button')
            : t('page.proposal_detail.grant.pending_update_modal.secondary_button_additional')
        }
      />
    </div>
  )
}
