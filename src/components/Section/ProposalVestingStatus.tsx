import React from 'react'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { ProposalAttributes } from '../../entities/Proposal/types'
import { UpdateAttributes } from '../../entities/Updates/types'
import './DetailsSection.css'
import './ProposalVestingStatus.css'
import Date from '../Common/Date'

export type ProposalVestingStatusProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null
  loading?: boolean
  disabled?: boolean
  nextUpdate?: UpdateAttributes | null
  currentUpdate?: UpdateAttributes | null
  pendingUpdates?: UpdateAttributes[] | null
  onPostUpdateClick: () => void
}

export default function ProposalVestingStatus({
  proposal,
  loading,
  disabled,
  onPostUpdateClick,
  nextUpdate,
  currentUpdate,
  pendingUpdates,
  ...props
}: ProposalVestingStatusProps) {
  const t = useFormatMessage()
  const hasSubmittedUpdate = !!currentUpdate?.completion_date && !!pendingUpdates && pendingUpdates.length > 0

  return (
    <div
      {...props}
      className={TokenList.join([
        'DetailsSection',
        disabled && 'DetailsSection--disabled',
        loading && 'DetailsSection--loading',
        props.className,
      ])}
    >
      <div className="DetailsSection__Content">
        <span className="ProposalVestingStatus__UpdateDescription">
          <Markdown>{t('page.proposal_detail.grant.update_description')}</Markdown>
        </span>
        <Button
          disabled={hasSubmittedUpdate}
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
