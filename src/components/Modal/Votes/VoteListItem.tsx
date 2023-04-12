import React from 'react'

import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { navigate } from 'decentraland-gatsby/dist/plugins/intl'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { Vote } from '../../../entities/Votes/types'
import { abbreviateNumber } from '../../../entities/Votes/utils'
import locations from '../../../modules/locations'
import { formatChoice } from '../../../modules/votes/utils'

export type VoteListItemModalProps = {
  address: string
  vote: Vote
  choices: string[]
  isLowQuality?: boolean
  active?: boolean
}

export function VoteListItem({ address, vote, choices, isLowQuality, active }: VoteListItemModalProps) {
  const t = useFormatMessage()
  const [profile] = useAsyncMemo(async () => (address ? profiles.load(address) : null), [address], {
    callWithTruthyDeps: true,
  })
  return (
    <Grid.Row
      onClick={() => navigate(locations.profile({ address }))}
      key={address}
      className={TokenList.join([
        'VoteList__Item VotesList__DividerLine',
        isLowQuality && 'VoteList__Item--low-quality',
        isLowQuality && active && 'VoteList__Item--low-quality-active',
      ])}
    >
      <Grid.Column width={6}>
        <div>
          <Avatar size="small" address={address} />
          {profile && <span>{profile.name}</span>}
          {(!profile || !profile.name) && <Address value={address} />}
        </div>
      </Grid.Column>
      <Grid.Column width={6}>
        <p>{formatChoice(choices[vote.choice - 1])}</p>
      </Grid.Column>
      <Grid.Column>
        <p>{`${abbreviateNumber(vote.vp)} ${t('modal.votes_list.vp')}`}</p>
      </Grid.Column>
    </Grid.Row>
  )
}
