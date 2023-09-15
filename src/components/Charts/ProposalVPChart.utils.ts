import type { Chart, ScriptableTooltipContext } from 'chart.js'

import { Vote } from '../../entities/Votes/types'
import { DEFAULT_AVATAR_IMAGE } from '../../utils/Catalyst'
import { Avatar } from '../../utils/Catalyst/types'
import Time from '../../utils/date/Time'

type VoteWithAddress = Vote & { address: string }
type VoteWithProfile = VoteWithAddress & { profile?: Avatar }

const TOOLTIP_ID = 'ProposalVPChartTooltip'

export function getSortedVotes(votesMap: Record<string, Vote>) {
  return Object.entries(votesMap)
    .map<VoteWithAddress>(([address, vote]) => ({ address, ...vote, timestamp: vote.timestamp * 1000 }))
    .sort((a, b) => a.timestamp - b.timestamp)
}

export function getSegregatedVotes(votes: VoteWithAddress[], profileMap: Map<string, Avatar>) {
  const yesVotes: VoteWithProfile[] = []
  const noVotes: VoteWithProfile[] = []
  const abstainVotes: VoteWithProfile[] = []

  for (const vote of votes) {
    const profile = profileMap.get(vote.address.toLowerCase())
    const voteWithProfile = { ...vote, profile }

    if (voteWithProfile.choice === 1) {
      yesVotes.push(voteWithProfile)
    } else if (voteWithProfile.choice === 2) {
      noVotes.push(voteWithProfile)
    } else if (voteWithProfile.choice === 3) {
      abstainVotes.push(voteWithProfile)
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
  datasetMap: Record<string, VoteWithProfile[]>
  title: (choice: string, vp: number) => string
}
export function externalTooltipHandler({ context, datasetMap, title }: TooltipHandlerProps) {
  // Tooltip Element
  const { chart, tooltip } = context
  const tooltipEl = getOrCreateTooltip(chart)
  const dataPoint = tooltip.dataPoints?.[0].raw as { x: number; y: number } | undefined
  const dataIdx = tooltip.dataPoints?.[0].dataIndex
  const datasetLabel = tooltip.dataPoints?.[0].dataset.label || ''

  const vote = datasetMap[datasetLabel]?.[dataIdx]

  const username = vote?.profile?.name || vote?.address.slice(0, 7)
  const userVP = vote?.vp || 0
  const formattedTimestamp = Time(dataPoint?.x || 0).format('DD/MM/YY, HH:mm z')

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = '0'
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
  while (tooltipEl.firstChild) {
    tooltipEl.firstChild.remove()
  }

  // Add new children
  tooltipEl.appendChild(avatar)
  tooltipEl.appendChild(textContainer)

  const { offsetLeft: positionX, offsetTop: positionY, width } = chart.canvas

  const maxX = width * 0.8

  // Display, position, and set styles for font
  tooltipEl.style.opacity = '1'
  tooltipEl.style.left = positionX + Math.min(maxX, tooltip.caretX) + 'px'
  tooltipEl.style.top = positionY + tooltip.caretY + 'px'
}
