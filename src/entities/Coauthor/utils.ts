export function isCoauthoringUpdatable(proposalFinishDate: Date) {
  return Date.now() < proposalFinishDate.getTime()
}
