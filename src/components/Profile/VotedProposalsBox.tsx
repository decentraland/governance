import useFormatMessage from '../../hooks/useFormatMessage'
import useVotedProposals from '../../hooks/useVotedProposals'
import Empty from '../Common/Empty'
import FullWidthButton from '../Common/FullWidthButton'
import SkeletonBars from '../Common/SkeletonBars'
import Watermelon from '../Icon/Watermelon'
import ProfileProposalItem from '../Proposal/ProfileProposalItem'

import { ProfileBox } from './ProfileBox'
import './VotedProposalsBox.css'

interface Props {
  address: string
}

const PROPOSALS_PER_PAGE = 5

function VotedProposalsBox({ address }: Props) {
  const t = useFormatMessage()

  const { votes, isLoading, handleViewMore, hasMoreProposals } = useVotedProposals(address, PROPOSALS_PER_PAGE)

  return (
    <ProfileBox title={t('page.profile.voted_proposals.title')}>
      {isLoading && <SkeletonBars amount={votes.length || 3} height={89} />}
      {!isLoading &&
        (votes.length > 0 ? (
          votes.map((vote) => {
            return <ProfileProposalItem key={vote.id} votedProposal={vote} />
          })
        ) : (
          <Empty
            className="VotedProposalsBox__Empty"
            icon={<Watermelon />}
            description={t('page.profile.voted_proposals.empty')}
          />
        ))}
      {hasMoreProposals && (
        <FullWidthButton onClick={handleViewMore}>{t('page.profile.voted_proposals.button')}</FullWidthButton>
      )}
    </ProfileBox>
  )
}

export default VotedProposalsBox
