import React, { useMemo } from "react"
import useFormatMessage from "decentraland-gatsby/dist/hooks/useFormatMessage"
import Time from "decentraland-gatsby/dist/utils/date/Time"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { isEmpty } from "lodash"
import { UpdateStatus } from "../../entities/Updates/types"
import useProposalUpdates from "../../hooks/useProposalUpdates"

import Divider from "../Section/Divider"
import ProposalUpdate from "./ProposalUpdate"
import "./ProposalUpdates.css"

export default function ProposalUpdates({ proposalId }: { proposalId: string }) {
  const l = useFormatMessage()
  const [updates] = useProposalUpdates(proposalId)
  const now = Date.now()

  const publicUpdates = useMemo(
    () =>
      updates
        ?.filter(
          (item) =>
            item.status === UpdateStatus.Done ||
            item.status === UpdateStatus.Late ||
            Time.utc(item.due_date).isBefore(now)
        )
        .sort((a, b) => (Time(a.due_date).isAfter(b.due_date) ? -1 : 0)),
    [updates]
  )

  if (isEmpty(publicUpdates)) {
    return null // TODO: Add empty state
  }

  return (
    <div className="ProposalUpdates">
      <Divider />
      <div className="ProposalUpdates__Header">
        <Header>{l("page.proposal_detail.grant.update_title")}</Header>
      </div>
      <div>
        {publicUpdates &&
          publicUpdates.map((item, index) => (
            <ProposalUpdate key={item.id} proposalId={proposalId} update={item} expanded={index === 0} />
          ))}
      </div>
    </div>
  )
}
