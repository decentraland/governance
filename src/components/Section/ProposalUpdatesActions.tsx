import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { UpdateAttributes } from '../../entities/Updates/types'
import { getOnTimeThresholdDate } from '../../entities/Updates/utils'
import DateTooltip from '../Common/DateTooltip'
import Helper from '../Helper/Helper'

import './ProposalUpdatesActions.css'

type ProposalUpdatesActionsProps = {
  nextUpdate?: UpdateAttributes | null
  currentUpdate?: UpdateAttributes | null
  pendingUpdates?: UpdateAttributes[] | null
  onPostUpdateClick: () => void
}

export default function ProposalUpdatesActions({
  onPostUpdateClick,
  nextUpdate,
  currentUpdate,
  pendingUpdates,
}: ProposalUpdatesActionsProps) {
  const t = useFormatMessage()
  const hasSubmittedUpdate = !!currentUpdate?.completion_date && !!pendingUpdates && pendingUpdates.length > 0
  const thresholdDate = getOnTimeThresholdDate(currentUpdate?.due_date)
  const canSubmitUpdate = (!nextUpdate && !currentUpdate) || Time().isAfter(thresholdDate)

  return (
    <div className="DetailsSection">
      <div className="DetailsSection__Content">
        <span className="ProposalUpdatesActions__UpdateDescription">
          <Markdown>{t('page.proposal_detail.grant.update_description')}</Markdown>
        </span>
        <Button
          disabled={hasSubmittedUpdate || !canSubmitUpdate}
          onClick={onPostUpdateClick}
          className="ProposalUpdatesActions__UpdateButton"
          primary
        >
          {t('page.proposal_detail.grant.update_button')}
        </Button>
        {!hasSubmittedUpdate && nextUpdate?.due_date && currentUpdate?.due_date && (
          <span className="ProposalUpdatesActions__DueDate">
            <DateTooltip date={currentUpdate.due_date}>
              <Markdown>
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
        {hasSubmittedUpdate && !!currentUpdate?.due_date && nextUpdate?.due_date && (
          <span className="ProposalUpdatesActions__DueDate">
            <DateTooltip date={nextUpdate.due_date}>
              <Markdown>
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
