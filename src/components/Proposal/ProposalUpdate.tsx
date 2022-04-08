import React, { useCallback } from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import { UpdateAttributes, UpdateStatus } from '../../entities/Updates/types'
import { ProposalAttributes } from '../../entities/Proposal/types'
import CancelIcon from '../Icon/Cancel'
import DocumentIcon from '../Icon/Document'
import locations from '../../modules/locations'
import './ProposalUpdate.css'

interface Props {
  proposal: ProposalAttributes
  update: UpdateAttributes
  expanded: boolean
  onClick: (update: UpdateAttributes) => void
  index: number
}

export default function ProposalUpdate({ proposal, update, expanded, onClick, index }: Props) {
  const l = useFormatMessage()
  const [account] = useAuthContext()
  const { introduction, status, completion_date } = update

  const isOwner = account && proposal.user === account
  const missedUpdateText = isOwner
    ? l('page.proposal_detail.grant.update_missed_owner')
    : l('page.proposal_detail.grant.update_missed')
  const UpdateIcon = completion_date ? DocumentIcon : CancelIcon

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

  if (expanded && completion_date) {
    return (
      <div
        role="button"
        onClick={handleClick}
        className={TokenList.join([
          'ProposalUpdate',
          'ProposalUpdate--expanded',
          `ProposalUpdate--${status}`,
          expanded && `ProposalUpdate--${status}-expanded`,
        ])}
      >
        <div className="ProposalUpdate__Heading">
          <div className="ProposalUpdate__Left">
            <UpdateIcon
              size="15"
              className={TokenList.join(['ProposalUpdate__Icon', `ProposalUpdate__Icon--${status}`])}
            />
            <span
              className={TokenList.join([
                'ProposalUpdate__Month',
                expanded && `ProposalUpdate__Month--expanded`,
                `ProposalUpdate__Month--${status}`,
              ])}
            >
              {l('page.proposal_detail.grant.update_index', { index })}
            </span>
          </div>
          <div className="ProposalUpdate__Date">{Time.from(completion_date).fromNow()}</div>
        </div>
        <div className="ProposalUpdate__Description--expanded">
          <span>{introduction}</span>
        </div>
        <div className={TokenList.join(['ProposalUpdate__KeepReading', `ProposalUpdate__KeepReading--${status}`])}>
          Keep reading
          <Icon name="chevron right" />
        </div>
        {!completion_date && isOwner && (
          <Button basic onClick={handlePostUpdateClick}>
            {l('page.proposal_detail.grant.update_button')}
            <Icon name="chevron right" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      role="button"
      onClick={handleClick}
      className={TokenList.join(['ProposalUpdate', status === UpdateStatus.Pending && 'ProposalUpdate--pending'])}
    >
      <div className="ProposalUpdate__Left">
        <UpdateIcon className="ProposalUpdate__Icon" size="15" />
        <div className="ProposalUpdate__Description">
          <span className="ProposalUpdate__Month">{l('page.proposal_detail.grant.update_index', { index })}:</span>
          <span>{completion_date ? introduction : missedUpdateText}</span>
        </div>
      </div>
      {completion_date && (
        <div className="ProposalUpdate__Date">
          {Time.from(completion_date).fromNow()}
          <Icon name="chevron right" />
        </div>
      )}
      {!completion_date && isOwner && (
        <Button basic onClick={handlePostUpdateClick}>
          {l('page.proposal_detail.grant.update_button')}
        </Button>
      )}
    </div>
  )
}
