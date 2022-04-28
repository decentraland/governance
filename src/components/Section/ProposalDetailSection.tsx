import React from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Profile } from 'decentraland-gatsby/dist/utils/loader/profile'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { ProposalAttributes } from '../../entities/Proposal/types'
import { snapshotProposalUrl } from '../../entities/Proposal/utils'
import Username from '../User/Username'

const openIcon = require('../../images/icons/open.svg').default

export type ProposalDetailSectionProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> & {
  proposal?: ProposalAttributes | null
  profile?: Profile | null
  loading?: boolean
  disabled?: boolean
}

export default React.memo(function ProposalDetailSection({
  proposal,
  profile,
  loading,
  disabled,
  ...props
}: ProposalDetailSectionProps) {
  const t = useFormatMessage()

  return (
    <div
      {...props}
      className={TokenList.join([
        'DetailsSection',
        disabled && 'DetailsSection--disabled',
        loading && 'DetailsSection--loading',
        'ResultSection',
        props.className,
      ])}
    >
      <div className="DetailsSection__Content">
        <Header sub>{t('page.proposal_detail.details_label')}</Header>
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_user_label')}</div>
          <Username className="DetailsSection__Value" profile={profile} address={proposal?.user} />
        </div>
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_start_label')}</div>
          <div className="DetailsSection__Value">{proposal && Time.from(proposal.start_at).format('MMM DD HH:mm')}</div>
        </div>
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_finish_label')}</div>
          <div className="DetailsSection__Value">
            {proposal && Time.from(proposal.finish_at).format('MMM DD HH:mm')}
          </div>
        </div>
        <div className="DetailsSection__Flex">
          <div>{t('page.proposal_detail.details_snapshot_label')}</div>
          <div className="DetailsSection__Value">
            {proposal && (
              <Link href={snapshotProposalUrl(proposal)}>
                {'#' + proposal.snapshot_id.slice(0, 7)}
                <img src={openIcon} width="12" height="12" style={{ marginLeft: '.5rem' }} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
