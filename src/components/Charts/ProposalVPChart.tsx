import { useEffect, useMemo, useRef, useState } from 'react'
import { Chart } from 'react-chartjs-2'

import { ChartData, Chart as ChartJS, ScriptableTooltipContext } from 'chart.js'
import 'chart.js/auto'
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm'
import annotationPlugin from 'chartjs-plugin-annotation'

import { Vote } from '../../entities/Votes/types'
import useAbbreviatedFormatter from '../../hooks/useAbbreviatedFormatter'
import useFormatMessage from '../../hooks/useFormatMessage'
import useProfiles from '../../hooks/useProfiles'
import { Avatar } from '../../utils/Catalyst/types'
import Section from '../Proposal/View/Section'

import './ProposalVPChart.css'
import {
  HOUR_IN_MS,
  externalTooltipHandler,
  getAbstainColor,
  getDataset,
  getNoColor,
  getSegregatedVotes,
  getSortedVotes,
  getYesColor,
} from './ProposalVPChart.utils'

ChartJS.register(annotationPlugin)

interface Props {
  requiredToPass?: number | null
  voteMap: Record<string, Vote>
  isLoadingVotes?: boolean
  startTimestamp?: number
  endTimestamp?: number
}

const COMMON_DATASET_OPTIONS = {
  fill: false,
  stepped: 'before' as const,
  pointHoverRadius: 3,
  pointHoverBorderWidth: 8,
}

function ProposalVPChart({ requiredToPass, voteMap, isLoadingVotes, startTimestamp, endTimestamp }: Props) {
  const t = useFormatMessage()
  const YAxisFormat = useAbbreviatedFormatter()
  const chartRef = useRef<ChartJS>(null)
  const sortedVotes = useMemo(() => getSortedVotes(voteMap), [voteMap])
  const { profiles, isLoadingProfiles } = useProfiles(sortedVotes.map((vote) => vote.address))
  const profileByAddress = useMemo(
    () =>
      profiles.reduce((acc, { profile }) => {
        acc.set(profile.ethAddress.toLowerCase(), profile)
        return acc
      }, new Map<string, Avatar>()),
    [profiles]
  )
  const votes = useMemo(() => getSegregatedVotes(sortedVotes, profileByAddress), [profileByAddress, sortedVotes])

  const tooltipTitle = (choice: string, vp: number) =>
    t('page.proposal_view.votes_chart.tooltip_title', { choice, vp: vp.toLocaleString('en-US') })

  const [chartData, setChartData] = useState<ChartData<'line'>>({ datasets: [] })
  useEffect(() => {
    setChartData({
      datasets: [
        {
          label: 'Yes',
          data: getDataset(votes.yes, endTimestamp),
          borderColor: getYesColor(),
          backgroundColor: getYesColor(),
          pointHoverBorderColor: getYesColor(0.4),
          ...COMMON_DATASET_OPTIONS,
        },
        {
          label: 'No',
          data: getDataset(votes.no, endTimestamp),
          borderColor: getNoColor(),
          backgroundColor: getNoColor(),
          pointHoverBorderColor: getNoColor(0.4),
          ...COMMON_DATASET_OPTIONS,
        },
        {
          label: 'Abstain',
          data: getDataset(votes.abstain, endTimestamp),
          borderColor: getAbstainColor(),
          backgroundColor: getAbstainColor(),
          pointHoverBorderColor: getAbstainColor(0.4),
          ...COMMON_DATASET_OPTIONS,
        },
      ],
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votes.abstain.length, votes.no.length, votes.yes.length, endTimestamp])

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onHover: (e: any) => {
          if (e.native && e.native.target) {
            e.native.target.style.cursor = 'pointer'
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onLeave: (e: any) => {
          if (e.native && e.native.target) {
            e.native.target.style.cursor = 'default'
          }
        },
      },
      tooltip: {
        enabled: false,
        position: 'nearest' as const,
        external: (context: ScriptableTooltipContext<'line'>) =>
          externalTooltipHandler({ context, votes, title: tooltipTitle }),
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
        min: startTimestamp,
        max: sortedVotes[sortedVotes.length - 1]?.timestamp + HOUR_IN_MS * 2,
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
        border: {
          display: false,
        },
        padding: 5,
      },
    },
  }

  return (
    <Section title={t('page.proposal_view.votes_chart.title')} isLoading={isLoadingVotes || isLoadingProfiles}>
      <Chart id="ProposalVPChart" ref={chartRef} options={options} data={chartData} type="line" />
    </Section>
  )
}

export default ProposalVPChart
