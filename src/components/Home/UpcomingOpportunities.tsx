import useFormatMessage from '../../hooks/useFormatMessage'
import PriorityProposalsBox from '../Profile/PriorityProposalsBox'

import HomeSectionHeader from './HomeSectionHeader'
import './UpcomingOpportunities.css'

const UpcomingOpportunities = () => {
  const t = useFormatMessage()
  return (
    <div className="UpcomingOpportunities">
      <HomeSectionHeader
        title={t('page.home.priority_spotlight.title')}
        description={t('page.home.priority_spotlight.description')}
      />
      <PriorityProposalsBox />
    </div>
  )
}

export default UpcomingOpportunities
