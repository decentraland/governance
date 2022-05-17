import React from 'react'

import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { snapshotProposalUrl } from '../../entities/Proposal/utils'
import Username from '../User/Username'

import './ProposalDetailSection.css'

const openIcon = require('../../images/icons/open.svg').default

export type ProposalDetailSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal: ProposalAttributes
}

export default React.memo(function ProposalDetailSection({ proposal, ...props }: ProposalDetailSectionProps) {
  const t = useFormatMessage()

  return (
    <div {...props} className={TokenList.join(['DetailsSection', 'ResultSection', props.className])}>
      <div className="DetailsSection__Content">
        <Header sub>{t('page.proposal_detail.details_label')}</Header>
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_user_label')}</div>
          <Username address={proposal.user} linked />
        </div>
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_start_label')}</div>
          <div className="DetailsSection__Value">{Time.from(proposal.start_at).format('MMM DD HH:mm')}</div>
        </div>
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_finish_label')}</div>
          <div className="DetailsSection__Value">{Time.from(proposal.finish_at).format('MMM DD HH:mm')}</div>
        </div>
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_snapshot_label')}</div>
          <div className="DetailsSection__Value">
            <Link href={snapshotProposalUrl(proposal)}>
              {'#' + proposal.snapshot_id.slice(0, 7)}
              <img src={openIcon} width="12" height="12" className="ProposalDetailSection__Icon" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
})
