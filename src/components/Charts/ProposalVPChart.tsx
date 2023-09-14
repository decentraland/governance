import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Chart } from 'react-chartjs-2'

import { ChartData, Chart as ChartJS } from 'chart.js'
import 'chart.js/auto'
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm'
import annotationPlugin from 'chartjs-plugin-annotation'
import zoomPlugin from 'chartjs-plugin-zoom'

import { Vote } from '../../entities/Votes/types'
import useAbbreviatedFormatter from '../../hooks/useAbbreviatedFormatter'
import useFormatMessage from '../../hooks/useFormatMessage'
import Section from '../Proposal/View/Section'

import './ProposalVPChart.css'
import {
  externalTooltipHandler,
  getAbstainColor,
  getDataset,
  getNoColor,
  getSegregatedVotes,
  getSortedVotes,
  getYesColor,
} from './ProposalVPChart.utils'

ChartJS.register(zoomPlugin, annotationPlugin)

interface Props {
  requiredToPass?: number | null
  voteMap: Record<string, Vote>
}

const COMMON_DATASET_OPTIONS = {
  fill: false,
  stepped: 'before' as const,
  pointHoverRadius: 3,
  pointHoverBorderWidth: 8,
}

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
          borderColor: getYesColor(),
          backgroundColor: getYesColor(),
          pointHoverBorderColor: getYesColor(0.4),
          ...COMMON_DATASET_OPTIONS,
        },
        {
          label: 'No',
          data: getDataset(noVotes),
          borderColor: getNoColor(),
          backgroundColor: getNoColor(),
          pointHoverBorderColor: getNoColor(0.4),
          ...COMMON_DATASET_OPTIONS,
        },
        {
          label: 'Abstain',
          data: getDataset(abstainVotes),
          borderColor: getAbstainColor(),
          backgroundColor: getAbstainColor(),
          pointHoverBorderColor: getAbstainColor(0.4),
          ...COMMON_DATASET_OPTIONS,
        },
      ],
    })
  }, [abstainVotes, noVotes, yesVotes])

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        align: 'end' as const,
        labels: {
          boxHeight: 1,
          boxWidth: 10,
        },
      },
      tooltip: {
        // displayColors: false,
        // callbacks: {
        //   label: (context: TooltipItem<'line'>) => {
        //     const vp = context.formattedValue
        //     const choice = context.dataset.label
        //     return t('page.proposal_view.votes_chart.tooltip_label', { choice, vp })
        //   },
        //   afterLabel: (context: TooltipItem<'line'>) => {
        //     const idx = context.dataIndex
        //     const choice = context.dataset.label as keyof typeof segregatedVotesMap
        //     const vote = segregatedVotesMap[choice][idx]
        //     const formattedVP = vote.vp.toLocaleString('en-US')
        //     return t('page.proposal_view.votes_chart.tooltip_voter', { address: vote.address, vp: formattedVP })
        //   },
        // },
        enabled: false,
        position: 'nearest' as const,
        external: externalTooltipHandler,
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
            minRange: 86400000, // 1 day
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
            borderColor: 'rgb(115, 110, 125)',
            borderWidth: 1,
            borderDash: [5],
            label: {
              content: t('page.proposal_view.votes_chart.pass_threshold'),
              display: true,
              position: 'end' as const,
              yAdjust: 10,
              color: 'rgb(115, 110, 125)',
              backgroundColor: 'transparent',
              font: {
                weight: 'normal' as const,
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
        ticks: {
          autoSkip: true,
          maxTicksLimit: 4,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y: {
        ticks: {
          callback: (value: number | string) => `${YAxisFormat(Number(value))} VP`,
          autoSkip: true,
          maxTicksLimit: 5,
        },
        min: 0,
      },
    },
  }

  return (
    <Section title={t('page.proposal_view.votes_chart.title')} isNew>
      <Chart className="ProposalVPChart" ref={chartRef} options={options} data={chartData} type="line" />
    </Section>
  )
}

export default ProposalVPChart
