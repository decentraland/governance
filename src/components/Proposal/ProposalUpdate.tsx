import React, { useCallback } from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import { ProjectHealth, UpdateAttributes, UpdateStatus } from '../../entities/Updates/types'
import { ProposalAttributes } from '../../entities/Proposal/types'
import CancelIcon from '../Icon/Cancel'
import locations from '../../modules/locations'
import CheckIcon from '../Icon/Check'
import WarningIcon from '../Icon/Warning'
import QuestionCircleIcon from '../Icon/QuestionCircle'
import { isBetweenLateThresholdDate } from '../../entities/Updates/utils'
import Date from '../Common/Date'
import { formatDate } from '../../modules/time'
import './ProposalUpdate.css'

interface Props {
  proposal: ProposalAttributes
  update: UpdateAttributes
  expanded: boolean
  onClick: (update: UpdateAttributes) => void
  index: number
}

const getStatusIcon = (health: UpdateAttributes['health'], completion_date: UpdateAttributes['completion_date']) => {
  if (!completion_date) {
    return QuestionCircleIcon
  }

  switch (health) {
    case ProjectHealth.OnTrack:
      return CheckIcon
    case ProjectHealth.AtRisk:
      return WarningIcon
    case ProjectHealth.OffTrack:
    default:
      return CancelIcon
  }
}

const ProposalUpdate = ({ proposal, update, expanded, onClick, index }: Props) => {
  const t = useFormatMessage()
  const [account] = useAuthContext()
  const { introduction, status, health, completion_date, due_date } = update

  const isOwner = account && proposal.user === account
  const missedUpdateText = isOwner
    ? t('page.proposal_detail.grant.update_missed_owner')
    : t('page.proposal_detail.grant.update_missed')

  const UpdateIcon = getStatusIcon(health, completion_date)

  const handleClick = useCallback(() => {
    if (!completion_date) {
      return
    }

    onClick(update)
  }, [update])

  const handlePostUpdateClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      navigate(locations.submitUpdate({ id: update.id, proposalId: proposal.id }))
    },
    [update.id, proposal.id]
  )

  const formattedCompletionDate = completion_date ? formatDate(completion_date) : ''

  if (expanded && completion_date) {
    return (
      <div
        role="button"
        onClick={handleClick}
        className={TokenList.join(['ProposalUpdate', 'ProposalUpdate--expanded', `ProposalUpdate--${status}`])}
      >
        <div className="ProposalUpdate__Heading">
          <div className="ProposalUpdate__Left">
            <div className="ProposalUpdate__IconContainer">
              <UpdateIcon size="16" />
            </div>
            <span className={TokenList.join(['ProposalUpdate__Index', expanded && `ProposalUpdate__Index--expanded`])}>
              {t('page.proposal_detail.grant.update_index', { index })}
            </span>
          </div>
          <div className="ProposalUpdate__Date">
            <span className="ProposalUpdate__DateText">
              <Date date={completion_date}>{formattedCompletionDate}</Date>
            </span>
            {status === UpdateStatus.Late && (
              <span className="ProposalUpdate__Late">{t('page.proposal_detail.grant.update_late')}</span>
            )}
          </div>
        </div>
        <div className="ProposalUpdate__Description--expanded">
          <span>{introduction}</span>
        </div>
        <div className={TokenList.join(['ProposalUpdate__KeepReading', `ProposalUpdate__KeepReading--${health}`])}>
          {t('page.proposal_detail.grant.update_keep_reading')}
          <Icon name="chevron right" />
        </div>
      </div>
    )
  }

  const showPostUpdateButton = !completion_date && isOwner && isBetweenLateThresholdDate(due_date)

  return (
    <div
      role="button"
      onClick={handleClick}
      className={TokenList.join([
        'ProposalUpdate',
        status === UpdateStatus.Pending && 'ProposalUpdate--pending',
        !completion_date && 'ProposalUpdate--missed',
      ])}
    >
      <div className="ProposalUpdate__Left">
        <div className="ProposalUpdate__IconContainer">
          <UpdateIcon size="16" />
        </div>
        <div className="ProposalUpdate__Description">
          <span className="ProposalUpdate__Index">{t('page.proposal_detail.grant.update_index', { index })}:</span>
          <span>{completion_date ? introduction : missedUpdateText}</span>
        </div>
      </div>
      {completion_date && (
        <div className="ProposalUpdate__Date">
          <span className="ProposalUpdate__DateText">
            <Date date={completion_date}>{formattedCompletionDate}</Date>
          </span>
          {status === UpdateStatus.Late && (
            <span className="ProposalUpdate__Late">{t('page.proposal_detail.grant.update_late')}</span>
          )}
          <div>
            <Icon name="chevron right" />
          </div>
        </div>
      )}
      {showPostUpdateButton && (
        <Button basic onClick={handlePostUpdateClick}>
          {t('page.proposal_detail.grant.update_button')}
        </Button>
      )}
    </div>
  )
}

export default ProposalUpdate
