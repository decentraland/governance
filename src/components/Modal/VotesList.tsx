import React, { useMemo } from 'react'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'
import { VoteListItem } from './VoteListItem'
import { Vote } from '../../entities/Votes/types'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { ProposalAttributes } from '../../entities/Proposal/types'

import './ProposalModal.css'
import './VotesList.css'

export type VotesListModalProps = Omit<ModalProps, 'children'> & {
  proposal?: ProposalAttributes | null
  votes?: Record<string, Vote> | null
}

export function VotesList({ proposal, votes, ...props }: VotesListModalProps) {
  const t = useFormatMessage()
  const choices = useMemo((): string[] => proposal?.snapshot_proposal?.choices || [], [proposal])
  const votesList = useMemo(() => Object.entries(votes || {}).sort((a, b) => b[1].vp - a[1].vp), [votes])

  return (
    <Modal
      {...props}
      size="tiny"
      className={TokenList.join(['ProposalModal', 'VotesList', props.className])}
      closeIcon={<Close />}
    >
      <Modal.Content className="ProposalModal__Title">
        <Header>{t('modal.votes_list.title', { votes: Object.keys(votes || {}).length })}</Header>
      </Modal.Content>
      <div className="VotesList_Container_Header">
        <Grid columns="equal">
          <Grid.Row className="VotesList_Divider_Line">
            <Grid.Column width={6}>
              <div className="VotesList_Header">{t('modal.votes_list.voter')}</div>
            </Grid.Column>
            <Grid.Column width={6}>
              <div className="VotesList_Header">{t('modal.votes_list.voted')}</div>
            </Grid.Column>
            <Grid.Column>
              <div className="VotesList_Header">{t('modal.votes_list.vp')}</div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
      <div className="VotesList_Container_Items">
        <Grid columns="equal" className="VotesList_Divider">
          {votesList.map((vote) => {
            const [key, value] = vote
            return <VoteListItem key={key} address={key} vote={value} choices={choices} />
          })}
        </Grid>
      </div>
    </Modal>
  )
}
