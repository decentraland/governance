import React from 'react'
import { Link } from 'gatsby-plugin-intl'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { ProposalAttributes } from '../../entities/Proposal/types'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import locations from '../../modules/locations'
import './ProposalComments.css'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import Watermelon from '../Icon/Watermelon'
import ProposalComment from './ProposalComment'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import { Governance } from '../../api/Governance'

export type ProposalResultSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null,
  loading?: boolean,
}

export default React.memo(function ProposalComments({ proposal, loading, ...props }: ProposalResultSectionProps) {
  const l = useFormatMessage()
  const [comments] = useAsyncMemo(async () => Governance.get().getProposalComments(proposal!.id), [proposal])

  return <div className="ProposalComments">
    <hr />
    <div className="ProposalComments__Header">
      <Header>Comments</Header> {comments &&
    <Button basic as={Link} href={locations.balance()}>{l('page.proposal_comments.join_discussion_label')}</Button>}
    </div>
    <div {...props} className={TokenList.join([
      'ProposalComments',
      loading && 'ProposalComments--loading',
      props.className
    ])}>
      <div className="ProposalComments__Content">
        <Loader active={loading} />
        {!comments && <div className="ProposalComments__NoComments">
          <Watermelon />
          <Paragraph small secondary>{l('page.proposal_comments.no_comments_text')}</Paragraph>
          <Link to={locations.balance()}>{l('page.proposal_comments.join_discussion_label')}</Link>
        </div>}
        {comments && comments.length > 0 &&
          comments.map(comment => <ProposalComment
            key={comment.created_at}
            // avatar={comment.avatar_template}
            user={comment!.username}
            created_at={comment.created_at}
            cooked={comment.cooked}
          />)
        }
      </div>
    </div>
  </div>
})
