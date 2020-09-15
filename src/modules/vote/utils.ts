import { AggregatedVote, Vote, VoteBalance, VoteStatus } from './types'
import { COMMUNITY, Delay, INBOX, SAB, Time } from 'modules/app/types'
import { locations } from 'routing/locations'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAppDelay, isApp } from 'modules/app/utils'
import { CastParams } from 'routing/types'
import { VoteDescription } from 'modules/description/types'
import { Network } from 'modules/wallet/types'

export async function aggregatedVote(vote: Vote): Promise<AggregatedVote> {
  let status: VoteStatus = VoteStatus.Progress

  const balance = getVoteBalance(vote)
  const identifier = getVoteIdentifier(vote)

  if (isVoteEnacted(vote)) {
    status = VoteStatus.Enacted
  } else if (isVoteExpired(vote)) {
    if (isVotePassed(vote, balance)) {
      status = VoteStatus.Passed

    } else {
      status = VoteStatus.Rejected
    }
  }

  return Object.assign(vote, { status, balance, identifier })
}

export function getVoteExpiration(vote: Vote) {
  const details = getVoteIdentifier(vote)
  const votingTime = getAppDelay(details.appAddress)
  return Number(String(vote.startDate) + '000') + votingTime
}

export function isVoteExpired(vote: Vote) {
  return Date.now() > getVoteExpiration(vote)
}

function isVotePassed(vote: Vote, balance: VoteBalance) {
  const supportRequiredPercentage = Number(vote.supportRequiredPct) / 1e18
  const yea = Number(vote.yea)
  const nay = Number(vote.nay)

  const supportRequired = (yea + nay) * supportRequiredPercentage

  if (balance.yea < balance.supportPercentage) {
    return false
  }

  if (yea < supportRequired) {
    return false
  }

  return true
}

function isVoteEnacted(vote: Vote) {
  return !!vote.executed
}

function getVoteBalance(vote: Vote): VoteBalance {
  const approvalRequiredRatio = Number(vote.minAcceptQuorum) / 1e18
  const supportRequiredRatio = Number(vote.supportRequiredPct) / 1e18
  const totalTokens = Number(vote.votingPower)
  const yea = Number(vote.yea)
  const nay = Number(vote.nay)

  const totalVoting = yea + nay
  const supportRequired = totalTokens * supportRequiredRatio
  const approvalRequired = totalTokens * approvalRequiredRatio
  let yeaPercentage = 0
  let nayPercentage = 0
  let supportPercentage = 0
  let approvalPercentage = 0

  if (totalVoting > 0) {
    supportPercentage = Math.floor((yea / totalVoting) * 100)
    approvalPercentage = Math.floor((yea / totalTokens) * 100)
    yeaPercentage = supportPercentage

    if (totalVoting < supportRequired) {
      nayPercentage = Math.floor((nay / totalVoting) * 100)
    } else {
      nayPercentage = 100 - yeaPercentage
    }
  }

  return {
    supportRequiredPercentage: Math.ceil(supportRequiredRatio * 100),
    supportPercentage,
    approvalRequiredPercentage: Math.ceil(approvalRequiredRatio * 100),
    approvalRequired,
    approvalPercentage,
    totalTokens,
    yeaPercentage,
    nayPercentage,
    yea,
    nay
  }
}

export function getVoteTimeLeft(vote: Vote) {
  const expiration = getVoteExpiration(vote)
  const now = Date.now()
  const diff = expiration - now

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

export function getVoteIdentifier(vote: Vote) {
  // eg: appAddress:0x37187b0f2089b028482809308e776f92eeb7334e-voteId:0x0
  const entries = vote.id.split('-').map(section => section.split(':'))
  return Object.fromEntries(entries) as { appAddress: string, voteId: string }
}

export function getVoteUrl(vote: Vote, params?: CastParams) {
  const { appAddress, voteId } = getVoteIdentifier(vote)
  return locations.proposal(appAddress, Number(voteId), params)
}

export function filterVotes(votes: Record<string, AggregatedVote>, descriptions: Record<string, VoteDescription>): AggregatedVote[] {
  // return Object.values(votes)

  const voteBuffer = new Set()
  const voteList: AggregatedVote[] = []
  const sortedVotes = Object.values(votes)
    .sort(sortVotes)

  for (const vote of sortedVotes) {
    const voteApp = vote?.identifier?.appAddress
    const voteDescription = vote?.metadata || descriptions[vote.id]?.description
    if (voteApp && voteDescription) {
      if (isApp(voteApp, INBOX)) {
        if (
          !voteBuffer.has([Delay[Network.MAINNET], voteDescription].join('::')) &&
          !voteBuffer.has([Delay[Network.RINKEBY], voteDescription].join('::')) &&
          !voteBuffer.has([COMMUNITY[Network.RINKEBY], voteDescription].join('::')) &&
          !voteBuffer.has([COMMUNITY[Network.RINKEBY], voteDescription].join('::'))
        ) {
          voteBuffer.add([voteApp, voteDescription].join('::'))
          voteList.push(vote)
        }
      } else if (isApp(voteApp, SAB)) {
        if (
          !voteBuffer.has([Delay[Network.MAINNET], voteDescription].join('::')) &&
          !voteBuffer.has([Delay[Network.RINKEBY], voteDescription].join('::')) &&
          !voteBuffer.has([COMMUNITY[Network.RINKEBY], voteDescription].join('::')) &&
          !voteBuffer.has([COMMUNITY[Network.RINKEBY], voteDescription].join('::'))
        ) {
          voteBuffer.add([voteApp, voteDescription].join('::'))
          voteList.push(vote)
        }

      } else if (isApp(voteApp, Delay)) {
        if (
          !voteBuffer.has([COMMUNITY[Network.RINKEBY], voteDescription].join('::')) &&
          !voteBuffer.has([COMMUNITY[Network.RINKEBY], voteDescription].join('::'))
        ) {
          voteBuffer.add([voteApp, voteDescription].join('::'))
          voteList.push(vote)
        }

      } else {
        voteBuffer.add([voteApp, voteDescription].join('::'))
        voteList.push(vote)
      }
    }
  }

  return voteList
}

export function sortVotes(voteA: Vote, voteB: Vote) {
  return voteB.startDate.localeCompare(voteA.startDate, undefined, { sensitivity: 'base', ignorePunctuation: true })
}
