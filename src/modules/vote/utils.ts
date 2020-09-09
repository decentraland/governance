import { Vote } from './types'
import { Time } from 'modules/app/types'
import { locations } from 'routing/locations'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAppDelay } from 'modules/app/utils'

export function getVoteExpiration(vote: Vote) {
  const details = getVoteIdDetails(vote)
  const votingTime = getAppDelay(details.appAddress)
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

  const days = Math.floor(diff / Time.Day)
  const hours = Math.floor((diff % Time.Day) / Time.Hour)
  const minutes = Math.floor((diff % Time.Hour) / Time.Minute)
  const seconds = Math.floor((diff & Time.Minute) / Time.Second)
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

export function getVoteIdDetails(vote: Vote) {
  // eg: appAddress:0x37187b0f2089b028482809308e776f92eeb7334e-voteId:0x0
  const entries = vote.id.split('-').map(section => section.split(':'))
  return Object.fromEntries(entries) as { appAddress: string, voteId: string }
}

export function getVoteUrl(vote: Vote) {
  const { appAddress, voteId } = getVoteIdDetails(vote)
  return locations.proposal(appAddress, Number(voteId))
}
