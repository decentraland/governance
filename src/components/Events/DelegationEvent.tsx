import { addressShortener } from '../../helpers'
import useDclProfile from '../../hooks/useDclProfile'
import useFormatMessage from '../../hooks/useFormatMessage'
import { ActivityTickerEvent } from '../../shared/types/events'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import Link from '../Common/Typography/Link'
import Markdown from '../Common/Typography/Markdown'
import Text from '../Common/Typography/Text'

export default function DelegationEvent({ event }: { event: ActivityTickerEvent }) {
  const t = useFormatMessage()
  const delegateKey = event.event_type === 'delegation_set' ? 'new_delegate' : 'removed_delegate'
  const delegate = (event.event_data as never)[delegateKey]
  const { username } = useDclProfile(delegate)

  return (
    <Link href={locations.profile({ address: delegate })}>
      <Markdown
        className="ActivityTicker__ListItemMarkdown"
        componentsClassNames={{ strong: 'ActivityTicker__ListItemMarkdownTitle' }}
      >
        {t(`page.home.activity_ticker.${event.event_type}`, {
          delegator: event.author,
          [delegateKey]: username || addressShortener(delegate),
        })}
      </Markdown>
      <Text className="ActivityTicker__ListItemDate" size="xs">
        {Time(event.created_at).fromNow()}
      </Text>
    </Link>
  )
}
