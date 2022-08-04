import React, { useMemo, useRef } from 'react'
import Flickity from 'react-flickity-component'

import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useResponsive from 'decentraland-gatsby/dist/hooks/useResponsive'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import Responsive from 'semantic-ui-react/dist/commonjs/addons/Responsive'

import { DclData } from '../../api/DclData'
import { ProposalStatus } from '../../entities/Proposal/types'
import useProposals from '../../hooks/useProposals'
import useVotesCountByDate from '../../hooks/useVotesCountByDate'

import MetricsCard from './MetricsCard'
import './MetricsCards.css'

const flickityOptions = {
  cellAlign: 'left',
  accessibility: true,
  pageDots: false,
  prevNextButtons: false,
  draggable: true,
  dragThreshold: 10,
  selectedAttraction: 0.01,
  friction: 0.15,
}

const now = new Date()
const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDay() - 7)
const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDay())

const MetricsCards = () => {
  const responsive = useResponsive()
  const isMobile = responsive({ maxWidth: Responsive.onlyMobile.maxWidth })
  const flickity = useRef<Flickity>()
  const t = useFormatMessage()
  const [data] = useAsyncMemo(async () => DclData.get().getData())
  const treasuryAmount = useMemo(
    () =>
      data?.balances
        .reduce((acc, obj) => {
          return acc + Number(obj.amount) * obj.rate
        }, 0)
        .toFixed(2),
    [data?.balances]
  )

  const { proposals: activeProposals } = useProposals({
    status: ProposalStatus.Active,
    timeFrame: '2days',
    timeFrameKey: 'finish_at',
  })

  const { proposals: endingSoonProposals } = useProposals({
    status: ProposalStatus.Active,
  })

  const { votesCount: votesCountThisWeek } = useVotesCountByDate(oneWeekAgo, now)
  const { votesCount: votesCountLastMonth } = useVotesCountByDate(oneMonthAgo, now)

  const metricsData = useMemo(
    () => [
      {
        category: t('page.home.metrics.proposals'),
        title: t('page.home.metrics.active_proposals', { value: activeProposals?.total }),
        description: t('page.home.metrics.ending_soon', { value: endingSoonProposals?.total }),
      },
      {
        category: t('page.home.metrics.participation'),
        title: t('page.home.metrics.votes_this_week', { value: votesCountThisWeek }),
        description: t('page.home.metrics.votes_last_month', { value: votesCountLastMonth }),
      },
      {
        category: t('page.home.metrics.treasury'),
        title: `$${t('general.number', { value: treasuryAmount })}`,
        description: t('page.home.metrics.consolidated'),
      },
    ],
    [activeProposals, endingSoonProposals, t, treasuryAmount, votesCountThisWeek, votesCountLastMonth]
  )

  const content = metricsData.map((item) => (
    <MetricsCard key={item.category} category={item.category} title={item.title} description={item.description} />
  ))

  return (
    <>
      {isMobile ? (
        <Flickity
          className="MetricsCards__Carousel"
          options={flickityOptions}
          flickityRef={(ref) => (flickity.current = ref)}
        >
          {content}
        </Flickity>
      ) : (
        <Container>
          <div className="MetricsCards">{content}</div>
        </Container>
      )}
    </>
  )
}

export default MetricsCards
