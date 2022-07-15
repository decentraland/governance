export function coauthoringIsUpdatable(proposalFinishDate: Date) {
  return Date.now() < proposalFinishDate.getTime()
}
