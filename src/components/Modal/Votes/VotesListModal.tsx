import { useMemo, useState } from 'react'

import classNames from 'classnames'
import { Close } from 'decentraland-ui/dist/components/Close/Close'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Modal, ModalProps } from 'decentraland-ui/dist/components/Modal/Modal'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { VOTES_VP_THRESHOLD } from '../../../constants'
import { ProposalAttributes } from '../../../entities/Proposal/types'
import { VoteByAddress } from '../../../entities/Votes/types'
import useFormatMessage from '../../../hooks/useFormatMessage'
import useProposalChoices from '../../../hooks/useProposalChoices'
import FullWidthButton from '../../Common/FullWidthButton'
import '../ProposalModal.css'

import { VoteListItem } from './VoteListItem'
import './VotesListModal.css'

type Props = Omit<ModalProps, 'children'> & {
  proposal?: ProposalAttributes | null
  highQualityVotes?: VoteByAddress | null
  lowQualityVotes?: VoteByAddress | null
}

export default function VotesListModal({ proposal, highQualityVotes, lowQualityVotes, onClose, ...props }: Props) {
  const t = useFormatMessage()
  const choices = useProposalChoices(proposal)
  const [showLowQualityVotes, setShowLowQualityVotes] = useState(false)
  const sortedHighQualityVotes = useMemo(
    () => Object.entries(highQualityVotes || {}).sort((a, b) => b[1].vp - a[1].vp),
    [highQualityVotes]
  )
  const hasLowQualityVotes = useMemo(
    () => lowQualityVotes && Object.keys(lowQualityVotes).length > 0,
    [lowQualityVotes]
  )

  return (
    <Modal
      {...props}
      size="tiny"
      className={classNames('GovernanceContentModal', 'ProposalModal', 'VotesList', props.className)}
      closeIcon={<Close />}
      onClose={() => {
        setShowLowQualityVotes(false)
        onClose && onClose()
      }}
    >
      <Modal.Content>
        <div className="VotesList__Title">
          <Header>{t('modal.votes_list.title', { votes: Object.keys(highQualityVotes || {}).length })}</Header>
          {hasLowQualityVotes && (
            <Header sub>
              {t('modal.votes_list.subtitle', {
                votes: Object.keys(lowQualityVotes || {}).length,
                threshold: VOTES_VP_THRESHOLD,
              })}
            </Header>
          )}
        </div>
        <div className="VotesList__HeaderContainer">
          <Grid columns="equal">
            <Grid.Row className="VotesList__DividerLine">
              <Grid.Column width={6}>
                <div className="VotesList__Header">{t('modal.votes_list.voter')}</div>
              </Grid.Column>
              <Grid.Column width={4}>
                <div className="VotesList__Header">{t('modal.votes_list.voted')}</div>
              </Grid.Column>
              <Grid.Column width={3}>
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
            {hasLowQualityVotes && !showLowQualityVotes && (
              <Grid.Row className="VoteList__ShowButtonContainer">
                <FullWidthButton className="VoteList__ShowButton" onClick={() => setShowLowQualityVotes(true)}>
                  {t('modal.votes_list.show_more', { threshold: VOTES_VP_THRESHOLD })}
                </FullWidthButton>
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
