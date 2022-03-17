import React, { useCallback } from 'react'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { navigate } from 'gatsby-plugin-intl'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon'
import { UpdateAttributes } from '../../entities/Updates/types'
import './ProposalUpdate.css'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'
import { ProposalAttributes } from '../../entities/Proposal/types'

const updateIcon = require('../../images/icons/update.svg')
const cancelIcon = require('../../images/icons/cancel.svg')

interface Props {
  proposal: ProposalAttributes
  update: UpdateAttributes
  expanded: boolean
  onClick: (update: UpdateAttributes) => void
}

export default function ProposalUpdate({ proposal, update, expanded, onClick }: Props) {
  const l = useFormatMessage()
  const [account] = useAuthContext()
  const { title, description, status, completion_date, due_date } = update

  const isOwner = account && proposal.user === account
  const missedUpdateText = isOwner
    ? l('page.proposal_detail.grant.update_missed_owner')
    : l('page.proposal_detail.grant.update_missed')
  const icon = completion_date ? updateIcon : cancelIcon
  const date = !!due_date ? Time(due_date).format('MMMM') : Time(completion_date).format('MMMM')

  const handleClick = useCallback(() => {
    if (!completion_date) {
      return
    }

    onClick(update)
  }, [update])

  const handlePostUpdateClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      navigate(`/update?id=${update.id}&proposalId=${proposal.id}`)
    },
    [update.id, proposal.id]
  )

  return (
    <div
      role="button"
      onClick={handleClick}
      className={TokenList.join([
        'ProposalUpdate',
        `ProposalUpdate--${status}`,
        expanded && `ProposalUpdate--${status}-expanded`,
      ])}
    >
      <div className="ProposalUpdate__Left">
        <img className="ProposalUpdate__Icon" src={icon} aria-hidden="true" />
        <div className="ProposalUpdate__Description">
          <span className="ProposalUpdate__Number">{l('page.proposal_detail.grant.update_date', { date })}</span>
          <span>{completion_date ? `${title}. ${description}` : missedUpdateText}</span>
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
