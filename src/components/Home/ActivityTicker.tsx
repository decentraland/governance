import { useQuery } from '@tanstack/react-query'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { Governance } from '../../clients/Governance'
import { ONE_MINUTE_MS } from '../../hooks/constants'
import useFormatMessage from '../../hooks/useFormatMessage'
import { EventType, EventWithAuthor } from '../../shared/types/events'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import Avatar from '../Common/Avatar'
import Empty from '../Common/Empty'
import Heading from '../Common/Typography/Heading'
import Link from '../Common/Typography/Link'
import Markdown from '../Common/Typography/Markdown'
import Text from '../Common/Typography/Text'

import './ActivityTicker.css'

const getLink = (event: EventWithAuthor) => {
  if (event.event_type === EventType.ProposalCreated) {
    return locations.proposal(event.event_data.proposal_id)
  }

  if (event.event_type === EventType.UpdateCreated) {
    return locations.update(event.event_data.update_id)
  }

  if (event.event_type === EventType.Voted) {
    return locations.proposal(event.event_data.proposal_id)
  }
}

export default function ActivityTicker() {
  const t = useFormatMessage()
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => Governance.get().getLatestEvents(),
    refetchInterval: ONE_MINUTE_MS,
    refetchIntervalInBackground: true,
  })

  return (
    <div className="ActivityTicker">
      <div className="ActivityTicker__TitleContainer">
        <div className="ActivityTicker__Gradient" />
        <Heading className="ActivityTicker__Title" size="3xs" weight="normal">
          {t('page.home.activity_ticker.title')}
        </Heading>
      </div>
      {isLoading && (
        <div className="ActivityTicker__LoadingContainer">
          <Loader active />
        </div>
      )}
      {!isLoading && (
        <>
          {events && events.length === 0 && (
            <div className="ActivityTicker__EmptyContainer">
              <Empty description={t('page.home.activity_ticker.no_activity')} />
            </div>
          )}
          {events && events.length > 0 && (
            <div className="ActivityTicker__List">
              {events.map((item) => (
                <div key={item.id} className="ActivityTicker__ListItem">
                  <Link href={locations.profile({ address: item.address })}>
                    <Avatar size="xs" avatar={item.avatar} address={item.address} />
                  </Link>
                  <div>
                    <Link href={getLink(item)}>
                      <Markdown
                        className="ActivityTicker__ListItemMarkdown"
                        componentsClassNames={{ strong: 'ActivityTicker__ListItemMarkdownTitle' }}
                      >
                        {t(`page.home.activity_ticker.${item.event_type}`, {
                          author: item.author,
                          title: item.event_data.proposal_title.trim(),
                        })}
                      </Markdown>
                      <Text className="ActivityTicker__ListItemDate" size="xs">
                        {Time(item.created_at).fromNow()}
                      </Text>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
