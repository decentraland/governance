import React from 'react'
import { navigate } from 'gatsby-plugin-intl'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid/Grid"
import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Vote } from '../../entities/Votes/types'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { abbreviateNumber } from '../../entities/Votes/utils'
import locations from '../../modules/locations'

import './ProposalModal.css'
import './VotesList.css'

export type VotesListModalProps = Omit<ModalProps, 'children'> & {
  onClickAccept?: (e: React.MouseEvent<any>) => void
  votes?: Record<string, Vote> | null,
}

export function VotesList({onClickAccept, votes, ...props }: VotesListModalProps) {
  const l = useFormatMessage()

  return <Modal {...props} size="tiny" className={TokenList.join(['ProposalModal', 'VotesList' ,props.className])} closeIcon={<Close />}>
  <Modal.Content className="ProposalModal__Title">
    <Header>{Object.entries(votes || {}).length} {Object.entries(votes || {}).length === 1 ? 'Vote' : 'Votes'}</Header>
  </Modal.Content>
  <div className="VotesList_Container_Header">
    <Grid columns='equal'>
      <Grid.Row className="VotesList_Divider_Line">
        <Grid.Column width={8}>
          <div className="VotesList_Header">{l('modal.votes_list.voter')}</div>
        </Grid.Column>
        <Grid.Column >
          <div className="VotesList_Header">{l('modal.votes_list.voted')}</div>
        </Grid.Column>
        <Grid.Column>
          <div className="VotesList_Header">{l('modal.votes_list.vp')}</div>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>
  <div className="VotesList_Container_Items">
    <Grid columns='equal' className="VotesList_Divider">
      {Object.entries(votes || {}).sort((a, b) => b[1].vp - a[1].vp).map(vote => {
        const [key, value] = vote
        return (
          <Grid.Row onClick={() => navigate(locations.balance({ address: key }))} key={key} className="VoteList_Item VotesList_Divider_Line">
            <Grid.Column width={8}>
              <div>
                <Avatar size="small" address={key} style={{ marginRight: '.5rem' }} />
                <Address value={key} />
              </div>
            </Grid.Column>
            <Grid.Column>
              <p style={{ marginLeft: '0.5rem' }}>
                {value.choice === 1 ? l('modal.votes_list.voted_yes') : l('modal.votes_list.voted_no')}
              </p>
            </Grid.Column>
            <Grid.Column>
              <p style={{ marginLeft: '0.5rem' }}>{`${abbreviateNumber(value.vp)} ${l('modal.votes_list.vp')}`}</p>
            </Grid.Column>
          </Grid.Row>
        )
      })}
    </Grid>
  </div>
</Modal>
}