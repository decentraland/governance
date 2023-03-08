import React, { useEffect, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'

import { GrantRequest, GrantRequestTeam, TeamMember } from '../../entities/Grant/types'
import { userModifiedForm } from '../../entities/Proposal/utils'
import Label from '../Common/Label'
import SubLabel from '../Common/SubLabel'

import AddBox from './AddBox'
import AddTeamMemberModal from './AddTeamMemberModal'
import GrantRequestSection from './GrantRequestSection'
import TeamMemberItem from './TeamMemberItem'

export const INITIAL_GRANT_REQUEST_TEAM_STATE: GrantRequestTeam = {
  members: [],
}

interface Props {
  sectionNumber: number
  funding: GrantRequest['funding']
  onValidation: (data: GrantRequestTeam, sectionValid: boolean) => void
}

export default function GrantRequestTeamSection({ sectionNumber, onValidation }: Props) {
  const t = useFormatMessage()
  const [teamState, setTeamState] = useState(INITIAL_GRANT_REQUEST_TEAM_STATE)
  const isFormEdited = userModifiedForm(teamState, INITIAL_GRANT_REQUEST_TEAM_STATE)
  const [isModalOpen, setModalOpen] = useState(false)

  const handleSubmitItem = (item: TeamMember) => {
    setTeamState((prevState) => ({ members: [...prevState.members, item] }))
  }

  const isCompleted = !isEmpty(teamState.members)

  useEffect(() => {
    onValidation(teamState, isCompleted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamState, isCompleted])

  return (
    <GrantRequestSection
      shouldFocus={false}
      validated={isCompleted}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.team.title')}
      sectionNumber={sectionNumber}
    >
      <div className="GrantRequestSection__Content">
        <Label>{t('page.submit_grant.team.members_label')}</Label>
        <SubLabel>{t('page.submit_grant.team.members_detail')}</SubLabel>
        {teamState.members.map((item, index) => (
          <TeamMemberItem
            key={`${item.name}-${index}`}
            item={item}
            onDeleteClick={() =>
              setTeamState((prevState) => ({
                members: prevState.members.filter((i) => !isEqual(i, item)),
              }))
            }
          />
        ))}
        <AddBox onClick={() => setModalOpen(true)}>{t('page.submit_grant.team.add_member')}</AddBox>
      </div>
      {isModalOpen && (
        <AddTeamMemberModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmitItem} />
      )}
    </GrantRequestSection>
  )
}
