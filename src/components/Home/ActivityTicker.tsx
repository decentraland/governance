import { useQuery } from '@tanstack/react-query'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import { Governance } from '../../clients/Governance'
import { ONE_MINUTE_MS } from '../../hooks/constants'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import Avatar from '../Common/Avatar'
import Empty from '../Common/Empty'
import Heading from '../Common/Typography/Heading'
import Markdown from '../Common/Typography/Markdown'
import Text from '../Common/Typography/Text'

import './ActivityTicker.css'

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
          {!events && (
            <div className="ActivityTicker__EmptyContainer">
              <Empty title="No activity" />
            </div>
          )}
          {events && (
            <div className="ActivityTicker__List">
              {events.map((item) => (
                <div key={item.id} className="ActivityTicker__ListItem">
                  <Avatar size="xs" avatar={item.avatar} address={item.address} />
                  <div>
                    <Markdown
                      className="ActivityTicker__ListItemMarkdown"
                      componentsClassNames={{ strong: 'ActivityTicker__ListItemMarkdownTitle' }}
                    >
                      {t(`page.home.activity_ticker.${item.event_type}`, {
                        author: item.author,
                        title: item.event_data.proposal_title,
                      })}
                    </Markdown>
                    <Text className="ActivityTicker__ListItemDate" size="xs">
                      {Time(item.created_at).fromNow()}
                    </Text>
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
