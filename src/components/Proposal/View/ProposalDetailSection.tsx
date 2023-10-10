import classNames from 'classnames'

import { ProposalAttributes, ProposalType } from '../../../entities/Proposal/types'
import { snapshotProposalUrl } from '../../../entities/Proposal/utils'
import useCoAuthorsByProposal from '../../../hooks/useCoAuthorsByProposal'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'
import DateTooltip from '../../Common/DateTooltip'
import Link from '../../Common/Typography/Link'
import Username from '../../Common/Username'
import Open from '../../Icon/Open'

import ProposalDetailCoauthors from './ProposalDetailCoauthors'
import './ProposalDetailSection.css'
import SidebarHeaderLabel from './SidebarHeaderLabel'

interface Props {
  proposal: ProposalAttributes
  className?: string
}

const formatDate = (date: Date) => Time.from(date).format('MMM DD, YYYY HH:mm')

export default function ProposalDetailSection({ proposal, className }: Props) {
  const t = useFormatMessage()
  const coAuthors = useCoAuthorsByProposal(proposal)

  return (
    <div className={classNames('DetailsSection', 'DetailsSection--no-border', className)}>
      <div className="DetailsSection__Content">
        <SidebarHeaderLabel>{t('page.proposal_detail.details_label')}</SidebarHeaderLabel>
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_user_label')}</div>
          <Username address={proposal.user} linked />
        </div>
        {coAuthors.length > 0 && (
          <div className="DetailsSection__Flex">
            <div>{t('page.proposal_detail.details_coauthors_label')}</div>
            <div>
              {coAuthors.map((coauthor) => (
                <ProposalDetailCoauthors coauthor={coauthor} key={coauthor.address} />
              ))}
            </div>
          </div>
        )}
        {proposal.type === ProposalType.Bid && (
          <div className="DetailsSection__Flex">
            <div>{t('page.proposal_detail.details_submitted_label')}</div>
            <div className="DetailsSection__Value">
              <DateTooltip date={proposal.configuration.created_at}>
                {formatDate(proposal.configuration.created_at)}
              </DateTooltip>
            </div>
          </div>
        )}
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_published_label')}</div>
          <div className="DetailsSection__Value">
            <DateTooltip date={proposal.created_at}>{formatDate(proposal.created_at)}</DateTooltip>
          </div>
        </div>
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_start_label')}</div>
          <div className="DetailsSection__Value">
            <DateTooltip date={proposal.start_at}>{formatDate(proposal.start_at)}</DateTooltip>
          </div>
        </div>
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_finish_label')}</div>
          <div className="DetailsSection__Value">
            <DateTooltip date={proposal.finish_at}>{formatDate(proposal.finish_at)}</DateTooltip>
          </div>
        </div>
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_snapshot_label')}</div>
          <div className="DetailsSection__Value">
            <Link href={snapshotProposalUrl(proposal)}>
              {'#' + proposal.snapshot_id.slice(0, 7)}
              <Open className="ProposalDetailSection__Icon" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
