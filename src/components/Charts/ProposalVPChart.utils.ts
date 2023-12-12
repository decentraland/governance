import type { Chart, ScriptableTooltipContext } from 'chart.js'

import { Vote, VoteByAddress } from '../../entities/Votes/types'
import { DEFAULT_AVATAR_IMAGE } from '../../utils/Catalyst'
import { CatalystProfile } from '../../utils/Catalyst/types'
import Time from '../../utils/date/Time'

type VoteWithAddress = Vote & { address: string }
type VoteWithProfile = VoteWithAddress & { profile?: CatalystProfile }

const TOOLTIP_ID = 'ProposalVPChartTooltip'
export const HOUR_IN_MS = 60 * 60 * 1000
const DAY_IN_MS = 24 * HOUR_IN_MS

export function getSortedVotes(votesMap: VoteByAddress) {
  return Object.entries(votesMap)
    .map<VoteWithAddress>(([address, vote]) => ({ address, ...vote, timestamp: vote.timestamp * 1000 }))
    .sort((a, b) => a.timestamp - b.timestamp)
}

export function getSegregatedVotes(votes: VoteWithAddress[], profileMap: Map<string, CatalystProfile>) {
  const yes: VoteWithProfile[] = []
  const no: VoteWithProfile[] = []
  const abstain: VoteWithProfile[] = []

  for (const vote of votes) {
    const profile = profileMap.get(vote.address.toLowerCase())
    const voteWithProfile = { ...vote, profile }

    if (voteWithProfile.choice === 1) {
      yes.push(voteWithProfile)
    } else if (voteWithProfile.choice === 2) {
      no.push(voteWithProfile)
    } else if (voteWithProfile.choice === 3) {
      abstain.push(voteWithProfile)
    }
  }

  return { yes, no, abstain }
}

export function getDataset(votes: VoteWithAddress[], endTimestamp?: number) {
  type DataPoint = { x: number; y: number }
  const dataset = votes.reduce<DataPoint[]>(
    (acc, vote) => {
      const last = acc[acc.length - 1]
      const x = vote.timestamp
      const y = last ? last.y + vote.vp : vote.vp
      acc.push({ x, y })
      return acc
    },
    [{ x: 0, y: 0 }]
  )

  const last = dataset[dataset.length - 1]
  const result = endTimestamp ? [...dataset, { x: endTimestamp + DAY_IN_MS, y: last.y }] : dataset
  const hasNoVotes = result.length === 2 && result[0].y === result[1].y
  return hasNoVotes ? [] : result
}

function getColor(r: number, g: number, b: number, a = 1) {
  return `rgba(${r},${g},${b},${a})`
}

export function getYesColor(a?: number) {
  return getColor(68, 182, 0, a)
}

export function getNoColor(a?: number) {
  return getColor(255, 69, 69, a)
}

export function getAbstainColor(a?: number) {
  return getColor(115, 110, 125, a)
}

function getOrCreateTooltip(chart: Chart<'line'>) {
  let customTooltip: HTMLDivElement | null | undefined = chart.canvas.parentNode?.querySelector(`#${TOOLTIP_ID}`)

  if (!customTooltip) {
    customTooltip = document.createElement('div')
    customTooltip.id = TOOLTIP_ID

    chart.canvas.parentNode?.appendChild(customTooltip)
  }

  return customTooltip
}

type TooltipHandlerProps = {
  context: ScriptableTooltipContext<'line'>
  votes: Record<string, VoteWithProfile[]>
  title: (choice: string, vp: number) => string
}
export function externalTooltipHandler({ context, votes, title }: TooltipHandlerProps) {
  // Tooltip Element
  const { chart, tooltip } = context
  const customTooltip = getOrCreateTooltip(chart)
  const dataPoint = tooltip.dataPoints?.[0].raw as { x: number; y: number } | undefined
  const dataIdx = tooltip.dataPoints?.[0].dataIndex
  const datasetLabel = tooltip.dataPoints?.[0].dataset.label || ''

  const vote = votes[datasetLabel.toLowerCase()]?.[dataIdx - 1]

  const username = vote?.profile?.name || vote?.address.slice(0, 7)
  const userVP = vote?.vp || 0
  const formattedTimestamp = Time(dataPoint?.x || 0).format('DD/MM/YY, HH:mm z')

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    customTooltip.style.opacity = '0'
    return
  }

  //Set Avatar
  const avatar = document.createElement('img')
  avatar.className = 'avatar'
  avatar.src = vote?.profile?.avatar?.snapshots?.face256 || DEFAULT_AVATAR_IMAGE

  // Set Text
  const textContainer = document.createElement('div')
  textContainer.className = 'container'

  const titleElement = document.createElement('div')
  const userElement = document.createElement('strong')
  const userText = document.createTextNode(username)
  userElement.appendChild(userText)
  titleElement.appendChild(userElement)
  const titleText = document.createTextNode(title(datasetLabel, userVP))
  titleElement.appendChild(titleText)
  titleElement.className = 'title'

  const detailsElement = document.createElement('div')
  const details = document.createTextNode(`${formattedTimestamp}. Acc. VP: ${dataPoint?.y.toLocaleString('en-US')}`)
  detailsElement.appendChild(details)
  detailsElement.className = 'details'

  textContainer.appendChild(titleElement)
  textContainer.appendChild(detailsElement)

  // Remove old children
  while (customTooltip.firstChild) {
    customTooltip.firstChild.remove()
  }

  // Add new children
  customTooltip.appendChild(avatar)
  customTooltip.appendChild(textContainer)

  const tooltipWidth = customTooltip.clientWidth

  const { offsetLeft: positionX, offsetTop: positionY, clientWidth: canvasWidth } = chart.canvas

  const maxX = canvasWidth - tooltipWidth / 2
  const minX = tooltipWidth / 2

  const isLowerHalf = tooltip.caretX < canvasWidth / 2
  const xShift = isLowerHalf ? Math.max(minX, tooltip.caretX) : Math.min(maxX, tooltip.caretX)

  // Display and position
  customTooltip.style.opacity = '1'
  customTooltip.style.left = positionX + xShift + 'px'
  customTooltip.style.top = positionY + tooltip.caretY + 'px'
}
