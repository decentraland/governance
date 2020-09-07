import { Vote } from './types'
import { APP_DELAY, Delay } from 'modules/app/types'
import { locations } from 'routing/locations'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { Voting, Vote as AragonVote } from '@aragon/connect-voting'

export async function loadAllVotes(votingList: Voting[]): Promise<AragonVote[]> {

  let votes: AragonVote[] = []

  for (const voting of votingList) {
    const voteData = await voting.votes().catch(error => console.error(voting, error))
    votes = votes.concat((voteData || []).map(vote => {
      (vote as any)._connector = (voting as any)._connector
      return vote
    }))
  }

  return votes
}

export function getVoteExpiration(vote: Vote) {
  const appAddress: keyof typeof APP_DELAY = vote.appAddress as any
  const votingTime = APP_DELAY[appAddress] || APP_DELAY.DEFAULT
  return Number(vote.startDate) + votingTime
}

export function isVoteExpired(vote: Vote) {
  return Date.now() > getVoteExpiration(vote)
}

export function isVoteRejected(vote: Vote) {
  return isVoteExpired(vote) && !isVoteEnacted(vote) && !isVotePassed(vote)
}

export function isVotePassed(vote: Vote) {
  const minAcceptQuorumPct = Number(vote.minAcceptQuorum) / 1e18
  const supportRequiredPct = Number(vote.supportRequiredPct) / 1e18
  const votingPower = Number(vote.votingPower)
  const yea = Number(vote.yea)
  const nay = Number(vote.nay)

  const quorumRequired = votingPower * minAcceptQuorumPct
  const supportRequired = (yea + nay) * supportRequiredPct

  if (yea < quorumRequired) {
    return false
  }

  if (yea < supportRequired) {
    return false
  }

  return true
}

export function isVoteEnacted(vote: Vote) {
  return !!vote.executed
}

export function getVoteQuorumRequired(vote: Vote) {
  const acceptQuorumPct = Number(vote.minAcceptQuorum) / 1e18
  const votingPower = Number(vote.votingPower)
  return votingPower * acceptQuorumPct
}

export function getVoteSupportRequired(vote: Vote) {
  const supportRequiredPct = Number(vote.supportRequiredPct) / 1e18
  const yea = Number(vote.yea)
  const nay = Number(vote.nay)
  return (yea + nay) * supportRequiredPct
}

export function getVotePercentages(vote: Vote) {
  const acceptRequiredPct = Number(vote.minAcceptQuorum) / 1e18
  const supportRequiredPct = Number(vote.supportRequiredPct) / 1e18
  const votingPower = Number(vote.votingPower)
  const yea = Number(vote.yea)
  const nay = Number(vote.nay)

  const supportRequired = votingPower * supportRequiredPct
  const acceptRequired = votingPower * acceptRequiredPct
  const supportTotal = yea + nay
  let yeaSize = 0
  let naySize = 0

  if (supportTotal < supportRequired) {
    yeaSize = Math.floor((yea / supportRequired) * 100)
    naySize = Math.floor((nay / supportRequired) * 100)
  } else {
    yeaSize = yea === 0 ? 0 : nay === 0 ? 100 : Math.ceil((yea / supportTotal) * 100)
    naySize = nay === 0 ? 0 : 100 - yeaSize
  }

  const acceptPct = Math.floor((yea / votingPower) * 100)
  const supportPct = Math.floor((yea / supportTotal) * 100)

  return {
    acceptRequiredPct: Math.ceil(acceptRequiredPct * 100),
    supportRequiredPct: Math.ceil(supportRequiredPct * 100),
    supportRequired,
    acceptRequired,
    votingPower,
    acceptPct,
    supportPct,
    yeaPct: Math.floor((yea / votingPower) * 100),
    nayPct: Math.floor((nay / votingPower) * 100),
    yea: yeaSize,
    nay: naySize
  }
}

export function getVoteTimeLeft(vote: Vote) {
  const expiration = getVoteExpiration(vote)
  const now = Date.now()
  const diff = Number(vote.startDate) + expiration - now

  if (diff <= 0) {
    return null
  }

  const days = Math.floor(diff / Delay.Day)
  const hours = Math.floor((diff % Delay.Day) / Delay.Hour)
  const minutes = Math.floor((diff % Delay.Hour) / Delay.Minute)
  const seconds = Math.floor((diff & Delay.Minute) / Delay.Second)
  const values = { days, hours, minutes, seconds }
  let key = 'proposal.'
  if (days > 0) {
    key += 'days_left'
  } else if (hours > 0) {
    key += 'hours_left'
  } else if (minutes > 0) {
    key += 'minutes_left'
  } else {
    key += 'seconds_left'
  }

  return t(key, values)
}

export function getVoteUrl(vote: Vote) {
  const decimalId = Number(vote.id.slice(vote.id.lastIndexOf(':') + 1))
  return locations.proposal(vote.appAddress, decimalId)
}