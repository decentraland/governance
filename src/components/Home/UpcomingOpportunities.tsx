import useFormatMessage from '../../hooks/useFormatMessage'
import PriorityProposalsBox from '../Profile/PriorityProposalsBox'

import './ActiveCommunityGrants.css'
import HomeSectionHeader from './HomeSectionHeader'

const UpcomingOpportunities = () => {
  const t = useFormatMessage()
  return (
    <div className="ActiveCommunityGrants">
      <HomeSectionHeader
        title={t('page.home.priority_spotlight.title')}
        description={t('page.home.priority_spotlight.description')}
      />
      <PriorityProposalsBox />
    </div>
  )
}

export default UpcomingOpportunities
