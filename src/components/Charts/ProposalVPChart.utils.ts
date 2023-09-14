import type { Chart, ScriptableTooltipContext } from 'chart.js'

import { Vote } from '../../entities/Votes/types'

type VoteWithAddress = Vote & { address: string }

const TOOLTIP_ID = 'ProposalVPChartTooltip'

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

export function externalTooltipHandler(context: ScriptableTooltipContext<'line'>) {
  // Tooltip Element
  const { chart, tooltip } = context
  const tooltipEl = getOrCreateTooltip(chart)
  const dataPoint = tooltip.dataPoints?.[0].raw as { x: number; y: number } | undefined
  const dataIdx: number | undefined = tooltip.dataPoints?.[0].dataIndex
  const datasetLabel = tooltip.dataPoints?.[0].dataset.label

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = '0'
    return
  }

  // Set Text
  const textContainer = document.createElement('div')
  textContainer.className = 'container'

  const titleElement = document.createElement('div')
  const title = document.createTextNode(`voted "${datasetLabel}"`)
  titleElement.appendChild(title)
  titleElement.className = 'title'

  const detailsElement = document.createElement('div')
  const details = document.createTextNode(`Acc. ${dataPoint?.y.toLocaleString('en-US')} VP`)
  detailsElement.appendChild(details)
  detailsElement.className = 'details'

  textContainer.appendChild(titleElement)
  textContainer.appendChild(detailsElement)

  // Remove old children
  while (tooltipEl.firstChild) {
    tooltipEl.firstChild.remove()
  }

  // Add new children
  tooltipEl.appendChild(textContainer)

  const { offsetLeft: positionX, offsetTop: positionY, width } = chart.canvas

  const maxX = width * 0.9

  // Display, position, and set styles for font
  tooltipEl.style.opacity = '1'
  tooltipEl.style.left = positionX + Math.min(maxX, tooltip.caretX) + 'px'
  tooltipEl.style.top = positionY + tooltip.caretY + 'px'
}
