import { useState } from 'react'

import classNames from 'classnames'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { Vote } from '../../../entities/Votes/types'
import { abbreviateNumber } from '../../../entities/Votes/utils'
import useFormatMessage from '../../../hooks/useFormatMessage'
import locations from '../../../utils/locations'
import { formatChoice } from '../../../utils/votes/utils'
import Link from '../../Common/Typography/Link'
import Username from '../../Common/Username'
import ReadReason from '../../Icon/ReadReason'
import UnreadReason from '../../Icon/UnreadReason'

export type VoteListItemModalProps = {
  address: string
  vote: Vote
  choices: string[]
  isLowQuality?: boolean
  active?: boolean
}

export function VoteListItem({ address, vote, choices, isLowQuality, active }: VoteListItemModalProps) {
  const t = useFormatMessage()
  const [showReason, setshowReason] = useState(false)
  return (
    <>
      <Grid.Row
        as={Link}
        href={locations.profile({ address })}
        key={address}
        className={classNames(
          'VoteList__Item VotesList__DividerLine',
          isLowQuality && 'VoteList__Item--low-quality',
          isLowQuality && active && 'VoteList__Item--low-quality-active',
          showReason && 'VotesList__DividerLine--none'
        )}
      >
        <Grid.Column width={6}>
          <Username className="VoteList__ItemUsername" address={address} size="sm" />
        </Grid.Column>
        <Grid.Column width={5}>
          <p>{formatChoice(choices[vote.choice - 1])}</p>
        </Grid.Column>
        <Grid.Column>
          <p>{`${abbreviateNumber(vote.vp)} ${t('modal.votes_list.vp')}`}</p>
        </Grid.Column>
        <Grid.Column
          width={2}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            e.preventDefault()
            setshowReason(!showReason)
          }}
        >
          {vote.reason && (showReason ? <ReadReason /> : <UnreadReason />)}
        </Grid.Column>
      </Grid.Row>
      <Grid.Row className={classNames('VoteList__ItemReason', showReason && 'VoteList__ItemReason--active')}>
        <Grid.Column>
          <p className="VoteList__ItemReasonText">{vote.reason}</p>
        </Grid.Column>
      </Grid.Row>
    </>
  )
}
