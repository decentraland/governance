import { useMemo } from 'react'

import { ProposalType } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProjects from '../../hooks/useProjects'
import PriorityProposalsBox from '../Profile/PriorityProposalsBox'

import './ActiveCommunityGrants.css'
import HomeSectionHeader from './HomeSectionHeader'

const GRANTS_TO_SHOW = 4

const UpcomingOpportunities = () => {
  const t = useFormatMessage()
  const { projects, isLoadingProjects } = useProjects()
  const grants = useMemo(() => projects?.data.filter((item) => item.type === ProposalType.Grant), [projects])

  return (
    <div className="ActiveCommunityGrants">
      <HomeSectionHeader
        title={'Upcoming Opportunities'}
        description={
          'Our DAO has implemented a new, inbound Bidding & Tendering mechanism that aims to surface project ideas to be scoped accordingly by potentially new and external teams.'
        }
      />
      {isLoadingProjects && null}
      <PriorityProposalsBox address={'0x549a9021661a85b6bc51c07b3a451135848d0048'} />
    </div>
  )
}

export default UpcomingOpportunities
