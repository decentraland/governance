import useFormatMessage from '../../hooks/useFormatMessage'
import { ActivityTickerEvent, ProposalCommentedEventData } from '../../shared/types/events'
import Time from '../../utils/date/Time'
import Link from '../Common/Typography/Link'
import Markdown from '../Common/Typography/Markdown'
import Text from '../Common/Typography/Text'

import { getLink } from './utils'

export default function ProposalRelatedEvent({ event }: { event: ActivityTickerEvent }) {
  const t = useFormatMessage()

  const eventData = event.event_data as ProposalCommentedEventData
  return (
    <Link href={getLink(event)}>
      <Markdown
        className="ActivityTicker__ListItemMarkdown"
        componentsClassNames={{ strong: 'ActivityTicker__ListItemMarkdownTitle' }}
      >
        {t(`page.home.activity_ticker.${event.event_type}`, {
          author: event.author || eventData.discourse_post.username,
          title: eventData.proposal_title.trim(),
        })}
      </Markdown>
      <Text className="ActivityTicker__ListItemDate" size="xs">
        {Time(event.created_at).fromNow()}
      </Text>
    </Link>
  )
}
