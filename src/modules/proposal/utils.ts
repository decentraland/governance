import connectVoting, { Voting } from '@aragon/connect-voting'
import connectDelay from '@1hive/connect-delay'
import { DelayedScript, AggregatedDelayedScript, AggregatedVote, ProposalType, Vote, VoteBalance, ProposalStatus, Delaying, Proposal } from './types'
import { App, COMMUNITY, Delay, INBOX, SAB, Time } from 'modules/app/types'
import { locations } from 'routing/locations'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { getAppDelay, isApp } from 'modules/app/utils'
import { CastParams } from 'routing/types'
import { ProposalDescription } from 'modules/description/types'
import { Network } from 'modules/wallet/types'
import { BigNumber, Contract } from 'ethers'

export async function createVoting(app: App) {
  return connectVoting(app as any)
    .catch(console.error)
}

export async function loadVotes(voting: Voting) {
  const votes = await voting.votes()
  return Promise.all(votes.map(aggregatedVote))
}

export async function createDelaying(app: App) {
  return connectDelay(app as any)
    .catch(console.error)
}

export async function loadDelayScripts(_delaying: Delaying) {
  // const scripts = await delaying.delayedScripts()
  // console.log(scripts)
  return [] // Promise.all(scripts.map(aggregateDelayedScript))
}

export async function loadDelayScriptsOnChain(contract: Contract) {
  try {
    const index: BigNumber = await contract.delayedScriptsNewIndex()
    const scripts = await Promise.all(Array.from(Array(index.toNumber()), async (_, i) => {
      const id = getProposalId(contract.address, i)
      const [ executionTime, pausedAt, evmScript ]: [ BigNumber, BigNumber, string ] = await contract.delayedScripts(i)

      let canExecute = false
      if (evmScript !== '0x') {
        canExecute = await contract.canExecute(i)
      }

      return {
        id,
        canExecute,
        evmScript,
        executionTime: executionTime.toNumber(),
        pausedAt: pausedAt.toNumber()
      } as DelayedScript
    }))

    return Promise.all(scripts.map(aggregateDelayedScript))
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function aggregatedVote(vote: Vote): Promise<AggregatedVote> {
  let status: ProposalStatus = ProposalStatus.Progress

  const balance = getVoteBalance(vote)
  const identifier = getProposalIdentifier(vote)
  const proposalType = ProposalType.Vote as const

  if (isVoteEnacted(vote)) {
    status = ProposalStatus.Enacted
  } else if (isVoteExpired(vote)) {
    if (isVotePassed(balance)) {
      status = ProposalStatus.Passed

    } else {
      status = ProposalStatus.Rejected
    }
  }

  return Object.assign(vote, {
    proposalType,
    status,
    balance,
    identifier
  })
}

export async function aggregateDelayedScript(script: DelayedScript): Promise<AggregatedDelayedScript> {
  const proposalType = ProposalType.DelayScript as const
  const identifier = getProposalIdentifier(script)
  return Object.assign(script, {
    proposalType,
    identifier,
    status: script.evmScript === '0x' ? ProposalStatus.Hidden : ProposalStatus.Progress,
    script: script.evmScript
  })
}

export function getVoteExpiration(vote: Vote) {
  const details = getProposalIdentifier(vote)
  const votingTime = getAppDelay(details.appAddress)
  return Number(String(vote.startDate) + '000') + votingTime
}

export function isVoteExpired(vote: Vote) {
  return Date.now() > getVoteExpiration(vote)
}

function isVotePassed(balance: VoteBalance) {
  if (balance.yeaPercentage < balance.supportPercentage) {
    return false
  }

  if (balance.yea < balance.approvalRequired) {
    return false
  }

  return true
}

function isVoteEnacted(vote: Vote) {
  return !!vote.executed
}

function getVoteBalance(vote: Vote): VoteBalance {
  const decimals = BigNumber.from('1' + '0'.repeat(18))
  const approvalRequiredRatio = Number(vote.minAcceptQuorum) / Number(1e18)
  const supportRequiredRatio = Number(vote.supportRequiredPct) / Number(1e18)
  const totalTokens = BigNumber.from(vote.votingPower).div(decimals).toNumber()
  const yea = BigNumber.from(vote.yea).div(decimals).toNumber()
  const nay = BigNumber.from(vote.nay).div(decimals).toNumber()

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
  return getTimeLeft(expiration)
}

export function getDelayTimeLeft(delayedScripts: DelayedScript) {
  if (delayedScripts.pausedAt) {
    return null
  }

  return getTimeLeft(delayedScripts.executionTime)
}

export function getTimeLeft(until: number) {
  const now = Date.now()
  const diff = until - now

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

export function getProposalIdentifier(identifier: { id: string }) {
  // eg: appAddress:0x37187b0f2089b028482809308e776f92eeb7334e-voteId:0x0
  const entries = identifier.id.split('-').map(section => section.split(':'))
  return Object.fromEntries(entries) as { appAddress: string, voteId: string, scriptId: string }
}

export function getProposalId(app: string, id: string | number) {
  const encodedId = Number(id).toString(16)
  const typeId = isApp(app, Delay) ? 'scriptId' : 'voteId'
  return `appAddress:${app}-${typeId}:0x${encodedId}`
}

export function getProposalUrl(proposal: Proposal, params?: CastParams) {
  const { appAddress, voteId, scriptId } = getProposalIdentifier(proposal)
  if (isApp(appAddress, Delay)) {
    return locations.delay(appAddress, Number(scriptId), params)
  } else {
    return locations.vote(appAddress, Number(voteId), params)
  }
}

export function filterProposals(
  proposals: Record<string, Proposal>,
  descriptions: Record<string, ProposalDescription>,
  network: Network
): Proposal[] {
  // return Object.values(votes)

  const proposalBuffer = new Set()
  const proposalList: Proposal[] = []
  const sortedProposals = Object.values(proposals)
    .sort(sortProposals)

  for (const proposal of sortedProposals) {
    const appAddress = proposal?.identifier?.appAddress
    const proposalDescription = (proposal as AggregatedVote).metadata || descriptions[proposal.id]?.description
    const proposalKey = [appAddress, proposalDescription].join('::')
    if (appAddress && proposalDescription) {
      if (appAddress === INBOX[network]) {
        if (
          !proposalBuffer.has([Delay[network], proposalDescription].join('::')) &&
          !proposalBuffer.has([COMMUNITY[network], proposalDescription].join('::'))
        ) {
          proposalBuffer.add(proposalKey)
          proposalList.push(proposal)
        }

      } else if (appAddress === SAB[network]) {
        if (
          !proposalBuffer.has([Delay[network], proposalDescription].join('::')) &&
          !proposalBuffer.has([COMMUNITY[network], proposalDescription].join('::'))
        ) {
          proposalBuffer.add(proposalKey)
          proposalList.push(proposal)
        }

      } else if (appAddress === Delay[network]) {
        if (
          !proposalBuffer.has([COMMUNITY[network], proposalDescription].join('::'))
        ) {
          proposalBuffer.add(proposalKey)
          proposalList.push(proposal)
        }

      } else if (appAddress === INBOX[network]) {
        proposalBuffer.add(proposalKey)
        proposalList.push(proposal)
      }
    }
  }

  return proposalList
}

export function sortProposals(proposalA: Proposal, proposalB: Proposal) {
  const dateA = String((proposalA as AggregatedVote).startDate || (proposalA as AggregatedDelayedScript).pausedAt || (proposalA as AggregatedDelayedScript).executionTime || 0)
  const dateB = String((proposalB as AggregatedVote).startDate || (proposalB as AggregatedDelayedScript).pausedAt || (proposalB as AggregatedDelayedScript).executionTime || 0)
  return dateB.localeCompare(dateA, undefined, { sensitivity: 'base', ignorePunctuation: true })
}
