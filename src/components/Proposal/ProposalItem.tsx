import classNames from 'classnames'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Desktop, useTabletAndBelowMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { ProposalAttributes } from '../../entities/Proposal/types'
import { VoteByAddress } from '../../entities/Votes/types'
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
  proposal: Pick<ProposalAttributes, 'id' | 'title' | 'finish_at' | 'start_at' | 'type' | 'status' | 'user'>
  hasCoauthorRequest?: boolean
  votes?: VoteByAddress
  slim?: boolean
  customText?: string
  anchor?: string
}

export default function ProposalItem({ proposal, hasCoauthorRequest, votes, slim = false, customText, anchor }: Props) {
  const t = useFormatMessage()
  const isMobile = useTabletAndBelowMediaQuery()
  const { id, title, status, type, user, start_at, finish_at } = proposal
  const timeout = useCountdown(finish_at)
  const isCountdownRunning = timeout.time > 0
  const hasStarted = Time().isAfter(start_at)
  const endLabel = isCountdownRunning
    ? `${t('page.proposal_list.finish_label.ends')} `
    : `${t('page.proposal_list.finish_label.ended')} `
  const label = hasStarted ? endLabel : `${t('page.proposal_list.finish_label.starts')} `
  const time = hasStarted ? finish_at : start_at
  const renderCustomText = customText && customText.length > 0

  return (
    <Card
      as={Link}
      href={locations.proposal(id, { anchor })}
      className={classNames(
        'ProposalItem',
        hasCoauthorRequest && 'ProposalItem--coauthor',
        slim && 'ProposalItem--slim'
      )}
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
            {!slim && <StatusPill status={status} />}
            <CategoryPill proposalType={type} />
            {renderCustomText ? (
              <span className="ProposalItem__CustomText">{customText}</span>
            ) : (
              <>
                <Username address={user} variant="avatar" size={isMobile ? 'xxs' : 'sm'} />
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
              </>
            )}
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
