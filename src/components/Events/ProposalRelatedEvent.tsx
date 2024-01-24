import useFormatMessage from '../../hooks/useFormatMessage'
import { ActivityTickerEvent, CommentedEventData, EventType, ProposalEventData } from '../../shared/types/events'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import Link from '../Common/Typography/Link'
import Markdown from '../Common/Typography/Markdown'
import Text from '../Common/Typography/Text'

const getLink = (event: ActivityTickerEvent) => {
  if (
    event.event_type === EventType.ProposalCreated ||
    event.event_type === EventType.Voted ||
    event.event_type === EventType.Commented
  ) {
    return locations.proposal(event.event_data.proposal_id)
  }

  if (event.event_type === EventType.UpdateCreated) {
    return locations.update(event.event_data.update_id)
  }
}

export default function ProposalRelatedEvent({ event }: { event: ActivityTickerEvent }) {
  const t = useFormatMessage()

  return (
    <>
      <Link href={getLink(event)}>
        <Markdown
          className="ActivityTicker__ListItemMarkdown"
          componentsClassNames={{ strong: 'ActivityTicker__ListItemMarkdownTitle' }}
        >
          {t(`page.home.activity_ticker.${event.event_type}`, {
            author: event.author || (event.event_data as CommentedEventData).discourse_post.username,
            title: (event.event_data as ProposalEventData).proposal_title.trim(),
          })}
        </Markdown>
        <Text className="ActivityTicker__ListItemDate" size="xs">
          {Time(event.created_at).fromNow()}
        </Text>
      </Link>
    </>
  )
}
