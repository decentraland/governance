import React, { useCallback } from 'react'

import classNames from 'classnames'
import useAuth from 'decentraland-gatsby/dist/hooks/useAuth'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link, navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'

import { Grant, ProposalAttributes } from '../../../entities/Proposal/types'
import { UpdateAttributes, UpdateStatus } from '../../../entities/Updates/types'
import { isBetweenLateThresholdDate } from '../../../entities/Updates/utils'
import locations from '../../../modules/locations'
import { formatDate } from '../../../utils/date/Time'
import DateTooltip from '../../Common/DateTooltip'

import { getStatusIcon } from './ProposalUpdate'
import './ProposalUpdate.css'
import UpdateMenu from './UpdateMenu'

interface Props {
  proposal: ProposalAttributes | Grant
  update: UpdateAttributes
  index?: number
  isCoauthor?: boolean
  isLinkable?: boolean
  onEditClick: () => void
  onDeleteUpdateClick: () => void
}

const CollapsedProposalUpdate = ({
  proposal,
  update,
  index,
  isCoauthor,
  isLinkable,
  onEditClick,
  onDeleteUpdateClick,
}: Props) => {
  const t = useFormatMessage()
  const [account] = useAuth()

  const { introduction, status, health, completion_date, due_date } = update
  const updateLocation = locations.update(update.id)
  const Component = isLinkable ? Link : 'div'
  const UpdateIcon = getStatusIcon(health, completion_date)

  const isAllowedToPostUpdate = account && (proposal.user === account || isCoauthor)
  const missedUpdateText = isAllowedToPostUpdate
    ? t('page.proposal_detail.grant.update_missed_owner')
    : t('page.proposal_detail.grant.update_missed')
  const formattedCompletionDate = completion_date ? formatDate(completion_date) : ''
  const showPostUpdateButton = !completion_date && isAllowedToPostUpdate && isBetweenLateThresholdDate(due_date)

  const handlePostUpdateClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      navigate(locations.submitUpdate({ id: update.id, proposalId: proposal.id }))
    },
    [update.id, proposal.id]
  )

  const handleUpdateClick = useCallback(
    (e: React.MouseEvent<any>) => {
      e.preventDefault()
      navigate(updateLocation)
    },
    [updateLocation]
  )

  return (
    <Component
      href={completion_date ? updateLocation : undefined}
      onClick={isLinkable ? undefined : handleUpdateClick}
      className={classNames(
        'ProposalUpdate',
        status === UpdateStatus.Pending && 'ProposalUpdate--pending',
        !completion_date && 'ProposalUpdate--missed'
      )}
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
            <DateTooltip date={completion_date}>{formattedCompletionDate}</DateTooltip>
          </span>
          {status === UpdateStatus.Late && (
            <span className="ProposalUpdate__Late">{t('page.proposal_detail.grant.update_late')}</span>
          )}
          {isAllowedToPostUpdate && (
            <div className="ProposalUpdate__Menu">
              <UpdateMenu onEditClick={onEditClick} onDeleteClick={onDeleteUpdateClick} />
            </div>
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
    </Component>
  )
}

export default CollapsedProposalUpdate
