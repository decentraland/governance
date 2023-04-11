import React, { useMemo, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { VOTES_VP_THRESHOLD } from '../../../constants'
import { ProposalAttributes } from '../../../entities/Proposal/types'
import { Vote } from '../../../entities/Votes/types'
import '../ProposalModal.css'

import { VoteListItem } from './VoteListItem'
import './VotesList.css'

export type VotesListModalProps = Omit<ModalProps, 'children'> & {
  proposal?: ProposalAttributes | null
  highQualityVotes?: Record<string, Vote> | null
  lowQualityVotes?: Record<string, Vote> | null
}

export function VotesListModal({
  proposal,
  highQualityVotes,
  lowQualityVotes,
  onClose,
  ...props
}: VotesListModalProps) {
  const t = useFormatMessage()
  const choices = useMemo((): string[] => proposal?.snapshot_proposal?.choices || [], [proposal])
  const [showLowQualityVotes, setShowLowQualityVotes] = useState(false)
  const sortedHighQualityVotes = useMemo(
    () => Object.entries(highQualityVotes || {}).sort((a, b) => b[1].vp - a[1].vp),
    [highQualityVotes]
  )

  return (
    <Modal
      {...props}
      size="tiny"
      className={TokenList.join(['GovernanceContentModal', 'ProposalModal', 'VotesList', props.className])}
      closeIcon={<Close />}
      onClose={() => {
        setShowLowQualityVotes(false)
        onClose && onClose()
      }}
    >
      <Modal.Content>
        <div className="ProposalModal__Title">
          <Header>{t('modal.votes_list.title', { votes: Object.keys(highQualityVotes || {}).length })}</Header>
        </div>
        <div className="VotesList__HeaderContainer">
          <Grid columns="equal">
            <Grid.Row className="VotesList__DividerLine">
              <Grid.Column width={6}>
                <div className="VotesList__Header">{t('modal.votes_list.voter')}</div>
              </Grid.Column>
              <Grid.Column width={6}>
                <div className="VotesList__Header">{t('modal.votes_list.voted')}</div>
              </Grid.Column>
              <Grid.Column>
                <div className="VotesList__Header">{t('modal.votes_list.vp')}</div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
        <div className="VotesList__ItemsContainer">
          <Grid columns="equal" className="VotesList__Divider">
            {sortedHighQualityVotes.map((vote) => {
              const [key, value] = vote
              return <VoteListItem key={key} address={key} vote={value} choices={choices} />
            })}
            {lowQualityVotes && Object.keys(lowQualityVotes).length > 0 && !showLowQualityVotes && (
              <Grid.Row className="VoteList__ShowButtonContainer">
                <Button
                  className="VoteList__ShowButton"
                  basic
                  size="small"
                  onClick={() => setShowLowQualityVotes(true)}
                >
                  {t('modal.votes_list.show_more', { threshold: VOTES_VP_THRESHOLD })}
                </Button>
              </Grid.Row>
            )}
            <>
              {showLowQualityVotes && (
                <Grid.Row className="VoteList__LowQualityDividerContainer">
                  <div className="VoteList__LowQuality">
                    {t('modal.votes_list.low_quality_title', {
                      votes: Object.keys(lowQualityVotes || {}).length,
                      threshold: VOTES_VP_THRESHOLD,
                    })}
                  </div>
                </Grid.Row>
              )}
              {lowQualityVotes &&
                Object.entries(lowQualityVotes).map((vote) => {
                  const [key, value] = vote
                  return (
                    <VoteListItem
                      key={key}
                      address={key}
                      vote={value}
                      choices={choices}
                      isLowQuality
                      active={showLowQualityVotes}
                    />
                  )
                })}
            </>
          </Grid>
        </div>
      </Modal.Content>
    </Modal>
  )
}
