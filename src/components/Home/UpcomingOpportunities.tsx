import PriorityProposalsBox from '../Profile/PriorityProposalsBox'

import './ActiveCommunityGrants.css'
import HomeSectionHeader from './HomeSectionHeader'

const UpcomingOpportunities = () => {
  return (
    <div className="ActiveCommunityGrants">
      <HomeSectionHeader
        title={'Upcoming Opportunities'}
        description={
          'Our DAO has implemented a new, inbound Bidding & Tendering mechanism that aims to surface project ideas to be scoped accordingly by potentially new and external teams.'
        }
      />
      <PriorityProposalsBox />
    </div>
  )
}

export default UpcomingOpportunities
