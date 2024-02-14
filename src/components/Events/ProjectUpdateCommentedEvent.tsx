import useFormatMessage from '../../hooks/useFormatMessage'
import { ActivityTickerEvent, UpdateCommentedEventData } from '../../shared/types/events'
import Time from '../../utils/date/Time'
import Link from '../Common/Typography/Link'
import Markdown from '../Common/Typography/Markdown'
import Text from '../Common/Typography/Text'

import { extractUpdateNumber, getLink } from './utils'

export default function ProjectUpdateCommentedEvent({ event }: { event: ActivityTickerEvent }) {
  const t = useFormatMessage()

  const eventData = event.event_data as UpdateCommentedEventData
  return (
    <Link href={getLink(event)}>
      <Markdown
        className="ActivityTicker__ListItemMarkdown"
        componentsClassNames={{ strong: 'ActivityTicker__ListItemMarkdownTitle' }}
      >
        {t(`page.home.activity_ticker.${event.event_type}`, {
          author: event.author || eventData.discourse_post.username,
          update_title: extractUpdateNumber(eventData.discourse_post.topic_title),
          proposal_title: eventData.proposal_title.trim(),
        })}
      </Markdown>
      <Text className="ActivityTicker__ListItemDate" size="xs">
        {Time(event.created_at).fromNow()}
      </Text>
    </Link>
  )
}
