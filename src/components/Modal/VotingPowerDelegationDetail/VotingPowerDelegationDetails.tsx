import React, { useState } from 'react'

import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Address } from 'decentraland-ui/dist/components/Address/Address'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Modal } from 'decentraland-ui/dist/components/Modal/Modal'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import useProfile from '../../../hooks/useProfile'
import ChevronLeft from '../../Icon/ChevronLeft'
import { Candidate } from '../VotingPowerDelegationModal/VotingPowerDelegationModal'

import CandidateDetails from './CandidateDetails'
import './VotingPowerDelegationDetails.css'

type VotingPowerDelegationDetailProps = {
  candidate: Candidate
  onBackClick: () => void
}

function VotingPowerDelegationDetails({ candidate, onBackClick }: VotingPowerDelegationDetailProps) {
  const t = useFormatMessage()
  const { profile } = useProfile(candidate.address)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <Modal.Header className="VotingPowerDelegationDetails__Header">
        <Button basic aria-label={t('modal.vp_delegation.backButtonLabel')} onClick={onBackClick}>
          <ChevronLeft />
        </Button>
        <Avatar size="small" address={candidate.address} />
        {profile?.name || <Address value={candidate.address} />}
      </Modal.Header>
      <Modal.Content className="VotingPowerDelegationDetails__Content">
        <div className={TokenList.join(['Info', isExpanded && 'Info--expanded'])}>
          <Grid columns="equal">
            <Grid.Column width={10}>
              <CandidateDetails title={t('modal.vp_delegation.details.about_title')} content={candidate.bio} />
              <CandidateDetails
                title={t('modal.vp_delegation.details.involvement_title')}
                content={candidate.involvement}
              />
              <CandidateDetails
                title={t('modal.vp_delegation.details.motivation_title')}
                content={candidate.motivation}
              />
              <CandidateDetails title={t('modal.vp_delegation.details.vision_title')} content={candidate.vision} />
              <CandidateDetails
                title={t('modal.vp_delegation.details.most_important_issue_title')}
                content={candidate.most_important_issue}
              />
            </Grid.Column>
            <Grid.Column>
              <CandidateDetails title={t('modal.vp_delegation.details.links_title')} links={candidate.links} />
              <CandidateDetails
                title={t('modal.vp_delegation.details.relevant_skills_title')}
                skills={candidate.relevant_skills}
              />
            </Grid.Column>
          </Grid>
          <div className={TokenList.join(['Fadeout', isExpanded && 'Fadeout--hidden'])} />
        </div>
        <div className="ShowMore">
          <div className="Divider" />
          <Button secondary onClick={() => setIsExpanded((prev) => !prev)}>
            {t(`modal.vp_delegation.details.${!isExpanded ? 'show_more' : 'show_less'}`)}
          </Button>
        </div>
      </Modal.Content>
    </>
  )
}

export default VotingPowerDelegationDetails
