import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Chart } from 'react-chartjs-2'

import { ChartData, Chart as ChartJS, TooltipItem } from 'chart.js'
import 'chart.js/auto'
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm'
import annotationPlugin from 'chartjs-plugin-annotation'
import zoomPlugin from 'chartjs-plugin-zoom'

import { Vote } from '../../entities/Votes/types'
import useAbbreviatedFormatter from '../../hooks/useAbbreviatedFormatter'
import useFormatMessage from '../../hooks/useFormatMessage'

import { getDataset, getSegregatedVotes, getSortedVotes } from './ProposalVPChart.utils'

ChartJS.register(zoomPlugin, annotationPlugin)

interface Props {
  requiredToPass?: number | null
  voteMap: Record<string, Vote>
}

const YES_COLOR = '#44b600'
const NO_COLOR = '#ff4545'
const ABSTAIN_COLOR = '#736e7d'

function ProposalVPChart({ requiredToPass, voteMap }: Props) {
  const t = useFormatMessage()
  const YAxisFormat = useAbbreviatedFormatter()
  const chartRef = useRef<ChartJS>(null)
  const votes = useMemo(() => getSortedVotes(voteMap), [voteMap])
  const { yesVotes, noVotes, abstainVotes } = useMemo(() => getSegregatedVotes(votes), [votes])

  const segregatedVotesMap = {
    Yes: yesVotes,
    No: noVotes,
    Abstain: abstainVotes,
  }

  const [chartData, setChartData] = useState<ChartData<'line'>>({ datasets: [] })
  useEffect(() => {
    setChartData({
      datasets: [
        {
          label: 'Yes',
          data: getDataset(yesVotes),
          fill: false,
          borderColor: YES_COLOR,
          backgroundColor: YES_COLOR,
        },
        {
          label: 'No',
          data: getDataset(noVotes),
          fill: false,
          borderColor: NO_COLOR,
          backgroundColor: NO_COLOR,
        },
        {
          label: 'Abstain',
          data: getDataset(abstainVotes),
          fill: false,
          borderColor: ABSTAIN_COLOR,
          backgroundColor: ABSTAIN_COLOR,
        },
      ],
    })
  }, [abstainVotes, noVotes, yesVotes])

  const options = {
    responsive: true,
    plugins: {
      title: {
        text: t('page.proposal_view.votes_chart.title'),
        display: true,
        align: 'start' as const,
        padding: 0,
        color: '#16141A',
        font: {
          size: 17,
        },
      },
      legend: {
        display: true,
        align: 'end' as const,
        labels: {
          boxHeight: 1,
          boxWidth: 10,
        },
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const vp = context.formattedValue
            const choice = context.dataset.label
            return t('page.proposal_view.votes_chart.tooltip_label', { choice, vp })
          },
          afterLabel: (context: TooltipItem<'line'>) => {
            const idx = context.dataIndex
            const choice = context.dataset.label as keyof typeof segregatedVotesMap
            const vote = segregatedVotesMap[choice][idx]
            const formattedVP = vote.vp.toLocaleString('en-US')
            return t('page.proposal_view.votes_chart.tooltip_voter', { address: vote.address, vp: formattedVP })
          },
        },
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          mode: 'x' as const,
        },
        pan: {
          enabled: true,
          mode: 'x' as const,
          speed: 0.1,
        },
        limits: {
          x: {
            min: votes[0]?.timestamp || 0,
            max: votes[votes.length - 1]?.timestamp || 0,
          },
        },
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line' as const,
            display: !!requiredToPass,
            yMin: requiredToPass || 0,
            yMax: requiredToPass || 0,
            borderColor: 'rgba(115, 110, 125, 1)',
            borderWidth: 1,
            borderDash: [5],
            label: {
              content: t('page.proposal_view.votes_chart.pass_threshold'),
              display: true,
              position: 'end' as const,
              padding: {
                x: 6,
                y: 1,
              },
            },
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            day: 'DD/MM',
          },
        },
      },
      y: {
        ticks: {
          callback: (value: number | string) => `${YAxisFormat(Number(value))} VP`,
        },
        min: 0,
      },
    },
  }

  return <Chart ref={chartRef} options={options} data={chartData} type="line" />
}

export default ProposalVPChart
