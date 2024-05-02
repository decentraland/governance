import upperFirst from 'lodash/upperFirst'

import { VoteByAddress } from '../../entities/Votes/types'
import { Scores } from '../../entities/Votes/utils'

export function getPartyVotes(
  delegators: string[],
  votes: VoteByAddress | null | undefined,
  choices: string[]
): { votesByChoices: Scores; totalVotes: number } {
  let totalVotes = 0
  const votesByChoices: Scores = {}

  if (delegators.length === 0) return { votesByChoices, totalVotes }

  choices.map((_value, index) => (votesByChoices[index] = 0))

  delegators.map((delegator) => {
    if (votes && votes[delegator]) {
      totalVotes += 1
      const choiceIndex = votes[delegator].choice - 1
      votesByChoices[choiceIndex] += 1
    }
  })

  return { votesByChoices, totalVotes }
}

export function formatChoice(choice: string) {
  return upperFirst(choice)
}
