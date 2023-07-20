import React from 'react'

import { ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { proposalUrl } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'

import ProposalPendingModal from './ProposalPendingModal'

function getGoogleCalendarUrl(proposal: ProposalAttributes) {
  const { id, title, start_at } = proposal
  const url = proposalUrl(id)
  const params = new URLSearchParams()
  params.set('text', title)
  params.set('details', `${url}`)
  const startAtDate = Time.from(start_at, { utc: true })
  const dates = [
    startAtDate.format(Time.Formats.GoogleCalendar),
    Time.from(start_at, { utc: true }).add(1, 'hour').format(Time.Formats.GoogleCalendar),
  ]
  params.set('dates', dates.join('/'))

  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`
}

interface Props {
  proposal: ProposalAttributes
}

export default function TenderPublishedModal({ proposal, ...props }: Props & ModalProps) {
  const t = useFormatMessage()

  return (
    <ProposalPendingModal
      title={t(`modal.proposal_pending.tender_title`)}
      description={t(`modal.proposal_pending.tender_description`)}
      calendarUrl={getGoogleCalendarUrl(proposal)}
      {...props}
    />
  )
}
