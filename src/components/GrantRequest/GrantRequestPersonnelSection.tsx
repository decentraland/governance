import React, { useEffect, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import isEqual from 'lodash/isEqual'

import { GrantRequest, GrantRequestPersonnel, TeamMember } from '../../entities/Grant/types'
import { userModifiedForm } from '../../entities/Proposal/utils'
import Label from '../Common/Label'
import SubLabel from '../Common/SubLabel'

import AddBox from './AddBox'
import AddTeamMemberModal from './AddTeamMemberModal'
import GrantRequestSection from './GrantRequestSection'
import TeamMemberItem from './TeamMemberItem'

export const INITIAL_GRANT_REQUEST_PERSONNEL_STATE: GrantRequestPersonnel = {
  team: [],
}

interface Props {
  sectionNumber: number
  funding: GrantRequest['funding']
  onValidation: (data: GrantRequestPersonnel, sectionValid: boolean) => void
}

export default function GrantRequestPersonnelSection({ sectionNumber, onValidation }: Props) {
  const t = useFormatMessage()
  const [personnelState, setPersonnelState] = useState(INITIAL_GRANT_REQUEST_PERSONNEL_STATE)
  const isFormEdited = userModifiedForm(personnelState, INITIAL_GRANT_REQUEST_PERSONNEL_STATE)
  const [isModalOpen, setModalOpen] = useState(false)

  const handleSubmitItem = (item: TeamMember) => {
    setPersonnelState((prevState) => ({ team: [...prevState.team, item] }))
  }

  const isCompleted = false

  useEffect(() => {
    onValidation(personnelState, isCompleted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personnelState, isCompleted])

  return (
    <GrantRequestSection
      shouldFocus={false}
      validated={isCompleted}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.personnel.title')}
      sectionNumber={sectionNumber}
    >
      <div className="GrantRequestSection__Content">
        <Label>{t('page.submit_grant.personnel.team_label')}</Label>
        <SubLabel>{t('page.submit_grant.personnel.team_detail')}</SubLabel>
        {personnelState.team.map((item, index) => (
          <TeamMemberItem
            key={`${item.name}-${index}`}
            item={item}
            onDeleteClick={() =>
              setPersonnelState((prevState) => ({
                team: prevState.team.filter((i) => !isEqual(i, item)),
              }))
            }
          />
        ))}
        <AddBox disabled={isCompleted} onClick={() => setModalOpen(true)}>
          {t('page.submit_grant.personnel.team_add_member')}
        </AddBox>
      </div>
      <AddTeamMemberModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmitItem} />
    </GrantRequestSection>
  )
}
