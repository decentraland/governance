import { Committee, CommitteeName, Transparency } from '../../clients/Transparency'

export async function getCommitteesWithOpenSlots(): Promise<Committee[]> {
  const { committees } = await Transparency.getTeams()
  return committees.filter((committee) => committee.size > committee.members.length)
}

export async function hasOpenSlots(name: CommitteeName): Promise<boolean> {
  const committees = await getCommitteesWithOpenSlots()
  return !!committees.find((committee) => committee.name === name)
}
