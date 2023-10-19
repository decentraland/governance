import classNames from 'classnames'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Desktop } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { Vote } from '../../entities/Votes/types'
import useCountdown, { Countdown } from '../../hooks/useCountdown'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import CategoryPill from '../Category/CategoryPill'
import DateTooltip from '../Common/DateTooltip'
import Heading from '../Common/Typography/Heading'
import Link from '../Common/Typography/Link'
import Username from '../Common/Username'
import CoauthorRequestLabel from '../Status/CoauthorRequestLabel'
import StatusPill from '../Status/StatusPill'

import './ProposalItem.css'

function getTimeLabel(timeout: Countdown, date: Date, format?: 'short') {
  const time = Time(date)

  return timeout.time > 0 ? time.fromNow() : format === 'short' ? time.format('MM/DD/YY') : time.format('MMM DD, YYYY')
}

interface Props {
  proposal: ProposalAttributes
  hasCoauthorRequest?: boolean
  votes?: Record<string, Vote>
}

export default function ProposalItem({ proposal, hasCoauthorRequest, votes }: Props) {
  const t = useFormatMessage()
  const { id, title, status, type, user, start_at, finish_at } = proposal
  const timeout = useCountdown(finish_at)
  const isCountdownRunning = timeout.time > 0
  const hasStarted = Time().isAfter(start_at)
  const endLabel = isCountdownRunning
    ? `${t('page.proposal_list.finish_label.ends')} `
    : `${t('page.proposal_list.finish_label.ended')} `
  const label = hasStarted ? endLabel : `${t('page.proposal_list.finish_label.starts')} `
  const time = hasStarted ? finish_at : start_at

  return (
    <Card
      as={Link}
      href={locations.proposal(id)}
      className={classNames('ProposalItem', hasCoauthorRequest && 'ProposalItem--coauthor')}
    >
      <Card.Content>
        <div className="ProposalItem__TitleContainer">
          <Heading className="ProposalItem__Title" weight="semi-bold" size="sm">
            {title}
          </Heading>
          {hasCoauthorRequest && <CoauthorRequestLabel />}
        </div>
        <div className="ProposalItem__Status">
          <div className="ProposalItem__Details">
            <StatusPill status={status} />
            <CategoryPill proposalType={type} />
            <Username address={user} variant="avatar" />
            <div className="ProposalItem__Stats">
              {votes && (
                <Desktop>
                  <span className="ProposalItem__Votes">
                    {t('page.proposal_list.votes', { total: Object.keys(votes).length })}
                  </span>
                </Desktop>
              )}
              <span className="ProposalItem__FinishLabel">
                <DateTooltip date={time}>{`${label} ${getTimeLabel(timeout, time, 'short')}`}</DateTooltip>
              </span>
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
