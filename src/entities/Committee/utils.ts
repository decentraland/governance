import { Committee, CommitteeName, DclData } from '../../clients/DclData'

export async function getCommitteesWithOpenSlots(): Promise<Committee[]> {
  const { teams } = await DclData.get().getData()
  return teams.filter((team) => team.size > team.members.length)
}

export async function hasOpenSlots(name: CommitteeName): Promise<boolean> {
  const committees = await getCommitteesWithOpenSlots()
  return !!committees.find((committee) => committee.name === name)
}
