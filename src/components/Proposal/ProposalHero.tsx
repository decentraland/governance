import React, { Ref, forwardRef } from 'react'

import classNames from 'classnames'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Mobile } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalAttributes, ProposalStatus, ProposalType } from '../../entities/Proposal/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import locations from '../../utils/locations'
import CategoryPill, { ColorsConfig } from '../Category/CategoryPill'
import { PillColor } from '../Common/Pill'
import Link from '../Common/Typography/Link'
import ChevronRight from '../Icon/ChevronRight'
import StatusPill from '../Status/StatusPill'

import HeroBanner from './HeroBanner'
import './ProposalHero.css'

interface Props {
  proposal: ProposalAttributes | null
}

const ProposalHero = forwardRef(({ proposal }: Props, ref: Ref<HTMLDivElement>) => {
  const t = useFormatMessage()
  const color = ColorsConfig[proposal?.type || ProposalType.Grant]
  const isProposalActive = proposal?.status === ProposalStatus.Active
  return (
    <div className="ProposalHero__Container" ref={ref}>
      <HeroBanner proposalActive={isProposalActive} color={color} />
      <div className="ProposalHero__Text">
        <Mobile>
          <div
            className={classNames(
              'ProposalHero__Breadcrumb__Container',
              !isProposalActive && 'ProposalHero__Breadcrumb--active'
            )}
          >
            <Link href={locations.home()}>{'DAO'}</Link>
            <Link href={locations.proposals()}>{t('navigation.proposals')}</Link>
          </div>
        </Mobile>
        <h1 className={classNames('ProposalHero__Title', !isProposalActive && 'ProposalHero__Title--finished')}>
          {proposal?.title || ''}
        </h1>
        <Loader active={!proposal} />
        {proposal && (
          <div className="ProposalDetailPage__Labels">
            <StatusPill isLink status={proposal.status} color={isProposalActive ? PillColor.White : undefined} />
            <CategoryPill
              isLink
              proposalType={proposal.type}
              color={isProposalActive ? PillColor.Transparent : undefined}
            />
          </div>
        )}
      </div>
    </div>
  )
})

ProposalHero.displayName = 'ProposalHero'

export default ProposalHero
