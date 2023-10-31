import useFormatMessage from '../../hooks/useFormatMessage'
import useVotedProposals from '../../hooks/useVotedProposals'
import Empty from '../Common/Empty'
import FullWidthButton from '../Common/FullWidthButton'
import SkeletonBars from '../Common/SkeletonBars'
import Watermelon from '../Icon/Watermelon'
import ProfileProposalItem from '../Proposal/ProfileProposalItem'

import { ActionBox } from './ActionBox'
import './VotedProposalsBox.css'

interface Props {
  title: string
  info?: string
  address: string
  collapsible?: boolean
}

const PROPOSALS_PER_PAGE = 5

function VotedProposalsBox({ title, info, address, collapsible }: Props) {
  const t = useFormatMessage()

  const { votes, isLoading, handleViewMore, hasMoreProposals } = useVotedProposals(address, PROPOSALS_PER_PAGE)

  return (
    <ActionBox title={title} info={info} collapsible={collapsible}>
      {isLoading && <SkeletonBars amount={votes.length || 3} height={83.5} />}
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
    </ActionBox>
  )
}

export default VotedProposalsBox
