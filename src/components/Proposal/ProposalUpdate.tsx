import useFormatMessage from "decentraland-gatsby/dist/hooks/useFormatMessage"
import Time from "decentraland-gatsby/dist/utils/date/Time"
import TokenList from "decentraland-gatsby/dist/utils/dom/TokenList"
import { navigate } from "gatsby-plugin-intl"
import React from "react"
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { UpdateAttributes } from "../../entities/Updates/types"

import "./ProposalUpdate.css"

const updateIcon = require("../../images/icons/update.svg")
const cancelIcon = require("../../images/icons/cancel.svg")

interface Props {
  proposalId: string
  update: UpdateAttributes
  expanded: boolean
}

export default function ProposalUpdates({ proposalId, update, expanded }: Props) {
  const l = useFormatMessage()
  const { title, description, status, completion_date, due_date } = update

  const isOwner = true // TODO: Get if user is owner
  const missedUpdateText = isOwner
    ? l("page.proposal_detail.grant.update_missed_owner")
    : l("page.proposal_detail.grant.update_missed")
  const isLateUpdate = !!due_date && !!completion_date && due_date < completion_date
  const icon = completion_date && !isLateUpdate ? updateIcon : cancelIcon
  const date = !!due_date ? Time(due_date).format("MMMM") : Time(completion_date).format("MMMM")

  return (
    <div
      className={TokenList.join([
        "ProposalUpdate",
        `ProposalUpdate--${status}`,
        expanded && `ProposalUpdate--${status}-expanded`,
      ])}
    >
      <div className="ProposalUpdate__Left">
        <img className="ProposalUpdate__Icon" src={icon} aria-hidden="true" />
        <div className="ProposalUpdate__Description">
          <span className="ProposalUpdate__Number">{l("page.proposal_detail.grant.update_date", { date })}</span>
          <span>{completion_date ? `${title}. ${description}` : missedUpdateText}</span>
        </div>
      </div>
      {completion_date && <div className="ProposalUpdate__Date">{Time.from(completion_date).fromNow()}</div>}
      {!completion_date && isOwner && (
        <Button basic onClick={() => navigate(`/update?id=${update.id}&proposalId=${proposalId}`)}>
          {l("page.proposal_detail.grant.update_button")}
        </Button>
      )}
    </div>
  )
}
