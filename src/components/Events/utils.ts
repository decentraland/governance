import { ActivityTickerEvent, EventType } from '../../shared/types/events'
import locations from '../../utils/locations'

export const getLink = (event: ActivityTickerEvent) => {
  if (
    event.event_type === EventType.ProposalCreated ||
    event.event_type === EventType.Voted ||
    event.event_type === EventType.ProposalCommented
  ) {
    return locations.proposal(event.event_data.proposal_id)
  }

  if (event.event_type === EventType.UpdateCreated || event.event_type === EventType.ProjectUpdateCommented) {
    return locations.update(event.event_data.update_id)
  }
}

export function extractUpdateNumber(title: string) {
  const match = title.match(/Update #\d+/)
  return match ? match[0] : null
}
