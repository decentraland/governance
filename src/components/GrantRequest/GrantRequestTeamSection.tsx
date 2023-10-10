import { useCallback, useEffect, useState } from 'react'

import isEmpty from 'lodash/isEmpty'

import { GrantRequestTeam, TeamMember } from '../../entities/Grant/types'
import { userModifiedForm } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import SubLabel from '../Common/SubLabel'
import Label from '../Common/Typography/Label'
import ProjectRequestSection from '../ProjectRequest/ProjectRequestSection'

import AddBox from './AddBox'
import AddTeamMemberModal from './AddTeamMemberModal'
import BreakdownItem from './BreakdownItem'

export const INITIAL_GRANT_REQUEST_TEAM_STATE: GrantRequestTeam = {
  members: [],
}

interface Props {
  sectionNumber: number
  onValidation: (data: GrantRequestTeam, sectionValid: boolean) => void
  isDisabled?: boolean
}

export default function GrantRequestTeamSection({ sectionNumber, onValidation, isDisabled = false }: Props) {
  const t = useFormatMessage()
  const [teamState, setTeamState] = useState(INITIAL_GRANT_REQUEST_TEAM_STATE)
  const isFormEdited = userModifiedForm(teamState, INITIAL_GRANT_REQUEST_TEAM_STATE)
  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null)

  const handleSubmitItem = useCallback(
    (item: TeamMember) => {
      if (selectedTeamMember) {
        setTeamState((prevState) => {
          const replaceEditedItem = (i: TeamMember) => (i.name === selectedTeamMember.name ? item : i)

          return {
            members: prevState.members.map(replaceEditedItem),
          }
        })
        setSelectedTeamMember(null)
      } else {
        setTeamState((prevState) => ({ members: [...prevState.members, item] }))
      }
    },
    [selectedTeamMember]
  )

  const handleDeleteItem = useCallback(() => {
    if (selectedTeamMember) {
      setTeamState((prevState) => ({
        members: prevState.members.filter((i) => i.name !== selectedTeamMember.name),
      }))
      setModalOpen(false)
      setSelectedTeamMember(null)
    }
  }, [selectedTeamMember])

  const isCompleted = !isEmpty(teamState.members)

  useEffect(() => {
    onValidation(teamState, isCompleted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamState, isCompleted])

  return (
    <ProjectRequestSection
      shouldFocus={false}
      validated={isCompleted}
      isFormEdited={isFormEdited}
      sectionTitle={t('page.submit_grant.team.title')}
      sectionNumber={sectionNumber}
    >
      <Label>{t('page.submit_grant.team.members_label')}</Label>
      <SubLabel>{t('page.submit_grant.team.members_detail')}</SubLabel>
      {teamState.members.map((item, index) => (
        <BreakdownItem
          key={`${item.name}-${index}`}
          title={item.name}
          subtitle={item.role}
          onClick={() => {
            setSelectedTeamMember(item)
            setModalOpen(true)
          }}
        />
      ))}
      <AddBox disabled={isDisabled} onClick={() => setModalOpen(true)}>
        {t('page.submit_grant.team.add_member')}
      </AddBox>
      {isModalOpen && (
        <AddTeamMemberModal
          isOpen={isModalOpen}
          onClose={() => {
            if (selectedTeamMember) {
              setSelectedTeamMember(null)
            }
            setModalOpen(false)
          }}
          onSubmit={handleSubmitItem}
          onDelete={handleDeleteItem}
          selectedTeamMember={selectedTeamMember}
        />
      )}
    </ProjectRequestSection>
  )
}
