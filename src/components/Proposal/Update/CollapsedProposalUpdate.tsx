import React, { useCallback } from 'react'

import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'

import { GrantAttributes, ProposalAttributes } from '../../../entities/Proposal/types'
import { UpdateAttributes, UpdateStatus } from '../../../entities/Updates/types'
import { isBetweenLateThresholdDate } from '../../../entities/Updates/utils'
import locations from '../../../modules/locations'
import { formatDate } from '../../../modules/time'
import DateTooltip from '../../Common/DateTooltip'

import { getStatusIcon } from './ProposalUpdate'
import './ProposalUpdate.css'

interface Props {
  proposal: ProposalAttributes | GrantAttributes
  update: UpdateAttributes
  index?: number
  isCoauthor?: boolean
}

const CollapsedProposalUpdate = ({ proposal, update, index, isCoauthor }: Props) => {
  const t = useFormatMessage()
  const [account] = useAuthContext()

  const { introduction, status, health, completion_date, due_date } = update
  const UpdateIcon = getStatusIcon(health, completion_date)

  const isAllowedToPostUpdate = account && (proposal.user === account || isCoauthor)
  const missedUpdateText = isAllowedToPostUpdate
    ? t('page.proposal_detail.grant.update_missed_owner')
    : t('page.proposal_detail.grant.update_missed')
  const formattedCompletionDate = completion_date ? formatDate(completion_date) : ''
  const showPostUpdateButton = !completion_date && isAllowedToPostUpdate && isBetweenLateThresholdDate(due_date)

  const handleClick = useCallback(() => {
    if (!completion_date) {
      return
    }

    navigate(locations.update(update.id))
  }, [completion_date, update.id])

  const handlePostUpdateClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      navigate(locations.submitUpdate({ id: update.id, proposalId: proposal.id }))
    },
    [update.id, proposal.id]
  )

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
            <DateTooltip date={completion_date}>{formattedCompletionDate}</DateTooltip>
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

export default CollapsedProposalUpdate
