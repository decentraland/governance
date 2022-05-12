import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import { UpdateAttributes } from '../../entities/Updates/types'
import { getOnTimeThresholdDate } from '../../entities/Updates/utils'
import Date from '../Common/Date'
import Info from '../Icon/Info'

import './ProposalVestingStatus.css'

type ProposalVestingStatusProps = {
  nextUpdate?: UpdateAttributes | null
  currentUpdate?: UpdateAttributes | null
  pendingUpdates?: UpdateAttributes[] | null
  onPostUpdateClick: () => void
}

export default function ProposalVestingStatus({
  onPostUpdateClick,
  nextUpdate,
  currentUpdate,
  pendingUpdates,
}: ProposalVestingStatusProps) {
  const t = useFormatMessage()
  const hasSubmittedUpdate = !!currentUpdate?.completion_date && !!pendingUpdates && pendingUpdates.length > 0
  const thresholdDate = getOnTimeThresholdDate(currentUpdate?.due_date)
  const canSubmitUpdate = (!nextUpdate && !currentUpdate) || Time().isAfter(thresholdDate)

  return (
    <div className="DetailsSection">
      <div className="DetailsSection__Content">
        <span className="ProposalVestingStatus__UpdateDescription">
          <Markdown>{t('page.proposal_detail.grant.update_description')}</Markdown>
        </span>
        <Button
          disabled={hasSubmittedUpdate || !canSubmitUpdate}
          onClick={onPostUpdateClick}
          className="ProposalVestingStatus__UpdateButton"
          primary
        >
          {t('page.proposal_detail.grant.update_button')}
        </Button>
        {!hasSubmittedUpdate && nextUpdate?.due_date && currentUpdate?.due_date && (
          <span className="ProposalVestingStatus__DueDate">
            <Date date={currentUpdate.due_date}>
              <Markdown>
                {t('page.proposal_detail.grant.current_update_due_date', {
                  date: Time(currentUpdate.due_date).fromNow(true),
                })}
              </Markdown>
            </Date>
            <Popup
              content={t('page.proposal_detail.grant.current_update_info')}
              basic
              trigger={
                <div className="ProposalVestingStatus__InfoIconContainer">
                  <Info size="14" />
                </div>
              }
              on="hover"
              position="bottom right"
            />
          </span>
        )}
        {hasSubmittedUpdate && !!currentUpdate?.due_date && nextUpdate?.due_date && (
          <span className="ProposalVestingStatus__DueDate">
            <Date date={nextUpdate.due_date}>
              <Markdown>
                {t('page.proposal_detail.grant.next_update_due_date', {
                  date: Time(nextUpdate.due_date).fromNow(true),
                })}
              </Markdown>
            </Date>
          </span>
        )}
      </div>
    </div>
  )
}
