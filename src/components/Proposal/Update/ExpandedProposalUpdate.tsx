import React, { useCallback } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'

import { UpdateAttributes, UpdateStatus } from '../../../entities/Updates/types'
import locations from '../../../modules/locations'
import { formatDate } from '../../../modules/time'
import DateTooltip from '../../Common/DateTooltip'

import { getStatusIcon } from './ProposalUpdate'
import './ProposalUpdate.css'

interface Props {
  update: UpdateAttributes
  index?: number
}

const ExpandedProposalUpdate = ({ update, index }: Props) => {
  const t = useFormatMessage()
  const { introduction, status, health, completion_date } = update
  const UpdateIcon = getStatusIcon(health, completion_date)

  const handleClick = useCallback(() => {
    navigate(locations.update(update.id))
  }, [update.id])

  if (!completion_date) {
    return null
  }

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
          <span className={TokenList.join(['ProposalUpdate__Index', `ProposalUpdate__Index--expanded`])}>
            {t('page.proposal_detail.grant.update_index', { index })}
          </span>
        </div>
        <div className="ProposalUpdate__Date">
          <span className="ProposalUpdate__DateText">
            <DateTooltip date={completion_date}>{formatDate(completion_date)}</DateTooltip>
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

export default ExpandedProposalUpdate
