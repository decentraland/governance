import useFormatMessage from '../../hooks/useFormatMessage'
import PriorityProposalsBox from '../Profile/PriorityProposalsBox'

import './ActiveCommunityGrants.css'
import HomeSectionHeader from './HomeSectionHeader'

const UpcomingOpportunities = () => {
  const t = useFormatMessage()
  return (
    <div className="ActiveCommunityGrants">
      <HomeSectionHeader
        title={t('home.priority_homepage.title')}
        description={t('home.priority_homepage.description')}
      />
      <PriorityProposalsBox />
    </div>
  )
}

export default UpcomingOpportunities
