import { Header } from 'decentraland-ui/dist/components/Header/Header'

import useFormatMessage from '../../hooks/useFormatMessage'

import Charts from './Charts'
import './CommunityEngagement.css'
import TopVoters from './TopVoters'

function CommunityEngagement() {
  const t = useFormatMessage()

  return (
    <div id="engagement" className="CommunityEngagement">
      <div className="CommunityEngagement__Header">
        <Header>{t('page.home.community_engagement.title')}</Header>
        <p>{t('page.home.community_engagement.description')}</p>
      </div>
      <div className="CommunityEngagement__Data">
        <Charts />
        <TopVoters />
      </div>
    </div>
  )
}

export default CommunityEngagement
