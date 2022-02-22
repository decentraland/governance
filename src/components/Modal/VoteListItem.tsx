import React from 'react'
import { navigate } from 'gatsby-plugin-intl'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useAsyncMemo from 'decentraland-gatsby/dist/hooks/useAsyncMemo'
import profiles from 'decentraland-gatsby/dist/utils/loader/profile'
import { Vote } from '../../entities/Votes/types'
import { abbreviateNumber } from '../../entities/Votes/utils'
import locations from '../../modules/locations'
import { formatChoice } from '../../entities/Proposal/templates/messages'

export type VoteListItemModalProps = {
  address: string
  vote: Vote
  choices: string[]
}

export function VoteListItem({ address, vote, choices }: VoteListItemModalProps) {
  const l = useFormatMessage()
  const [ profile ] = useAsyncMemo(
    async () => address ? profiles.load(address) : null,
    [ address ],
    { callWithTruthyDeps: true }
  )
  return (
    <Grid.Row onClick={() => navigate(locations.balance({ address }))} key={address} className="VoteList_Item VotesList_Divider_Line">
      <Grid.Column width={6}>
        <div>
          <Avatar size="small" address={address} />
          {profile && <span>{profile.name}</span>}
          {(!profile || !profile.name) && <Address value={address} />}
        </div>
      </Grid.Column>
      <Grid.Column width={6}>
        <p>{formatChoice(choices[vote.choice-1])}</p>
      </Grid.Column>
      <Grid.Column>
        <p>{`${abbreviateNumber(vote.vp)} ${l('modal.votes_list.vp')}`}</p>
      </Grid.Column>
    </Grid.Row>
  )
}
