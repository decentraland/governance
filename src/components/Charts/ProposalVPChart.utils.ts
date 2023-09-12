import { Vote } from '../../entities/Votes/types'

type VoteWithAddress = Vote & { address: string }

export function getSortedVotes(votesMap: Record<string, Vote>) {
  return Object.entries(votesMap)
    .map<VoteWithAddress>(([address, vote]) => ({ address, ...vote, timestamp: vote.timestamp * 1000 }))
    .sort((a, b) => a.timestamp - b.timestamp)
}

export function getSegregatedVotes(votes: VoteWithAddress[]) {
  const yesVotes: VoteWithAddress[] = []
  const noVotes: VoteWithAddress[] = []
  const abstainVotes: VoteWithAddress[] = []

  for (const vote of votes) {
    if (vote.choice === 1) {
      yesVotes.push(vote)
    } else if (vote.choice === 2) {
      noVotes.push(vote)
    } else if (vote.choice === 3) {
      abstainVotes.push(vote)
    }
  }

  return { yesVotes, noVotes, abstainVotes }
}

export function getDataset(votes: VoteWithAddress[]) {
  type DataPoint = { x: number; y: number }
  return votes.reduce<DataPoint[]>((acc, vote) => {
    const last = acc[acc.length - 1]
    const x = vote.timestamp
    const y = last ? last.y + vote.vp : vote.vp
    acc.push({ x, y })
    return acc
  }, [])
}
