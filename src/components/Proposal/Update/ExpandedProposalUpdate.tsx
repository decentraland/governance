import { useCallback } from 'react'

import classNames from 'classnames'

import { ProjectHealth, UpdateAttributes, UpdateStatus } from '../../../entities/Updates/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import { formatDate } from '../../../utils/date/Time'
import locations, { navigate } from '../../../utils/locations'
import DateTooltip from '../../Common/DateTooltip'
import Link from '../../Common/Typography/Link'
import ChevronRight from '../../Icon/ChevronRight'

import { getStatusIcon } from './ProposalUpdate'
import './ProposalUpdate.css'
import UpdateMenu from './UpdateMenu'

interface Props {
  update: UpdateAttributes
  index?: number
  onEditClick: () => void
  onDeleteUpdateClick: () => void
  showMenu?: boolean
}

function getIconColor(health: ProjectHealth) {
  switch (health) {
    case ProjectHealth.OnTrack:
      return 'var(--green-800)'
    case ProjectHealth.AtRisk:
      return 'var(--yellow-800)'
    case ProjectHealth.OffTrack:
      return 'var(--red-800)'
  }
}

const ExpandedProposalUpdate = ({ update, index, onEditClick, onDeleteUpdateClick, showMenu }: Props) => {
  const t = useFormatMessage()
  const { introduction, status, health, completion_date } = update
  const UpdateIcon = getStatusIcon(health, completion_date)

  const handleUpdateClick = useCallback(
    (e: React.MouseEvent<any>) => {
      if (update.completion_date) {
        e.stopPropagation()
        e.preventDefault()
        navigate(locations.update(update.id))
      }
    },
    [update]
  )

  if (!completion_date) {
    return null
  }

  return (
    <Link
      href={locations.update(update.id)}
      onClick={handleUpdateClick}
      className={classNames('ProposalUpdate', 'ProposalUpdate--expanded', `ProposalUpdate--${status}`)}
    >
      <div className="ProposalUpdate__Heading">
        <div className="ProposalUpdate__Left">
          <div className="ProposalUpdate__IconContainer">
            <UpdateIcon size="16" />
          </div>
          <span className={classNames('ProposalUpdate__Index', `ProposalUpdate__Index--expanded`)}>
            {t('page.proposal_detail.grant.update_index', { index })}
          </span>
        </div>
        <div className="ProposalUpdate__Date">
          <span className="ProposalUpdate__DateText">
            <DateTooltip date={completion_date}>{formatDate(completion_date)}</DateTooltip>
          </span>
          {showMenu && (
            <div className="ProposalUpdate__Menu">
              <UpdateMenu onEditClick={onEditClick} onDeleteClick={onDeleteUpdateClick} />
            </div>
          )}
          {status === UpdateStatus.Late && (
            <span className="ProposalUpdate__Late">{t('page.proposal_detail.grant.update_late')}</span>
          )}
        </div>
      </div>
      <div className="ProposalUpdate__Description--expanded">
        <span>{introduction}</span>
      </div>
      <div className={classNames('ProposalUpdate__KeepReading', `ProposalUpdate__KeepReading--${health}`)}>
        {t('page.proposal_detail.grant.update_keep_reading')}
        {update?.health && <ChevronRight color={getIconColor(update.health)} />}
      </div>
    </Link>
  )
}

export default ExpandedProposalUpdate
