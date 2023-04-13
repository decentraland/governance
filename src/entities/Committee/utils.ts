import { Committee, CommitteeName, DclData } from '../../clients/DclData'

export async function getCommitteesWithOpenSlots(): Promise<Committee[]> {
  const { committees } = await DclData.get().getData()
  return committees.filter((committee) => committee.size > committee.members.length)
}

export async function hasOpenSlots(name: CommitteeName): Promise<boolean> {
  const committees = await getCommitteesWithOpenSlots()
  return !!committees.find((committee) => committee.name === name)
}
