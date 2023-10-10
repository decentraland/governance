import { useEffect, useMemo, useRef, useState } from 'react'
import { Chart } from 'react-chartjs-2'
import { useIntl } from 'react-intl'

import type { ChartArea, ChartData, Chart as ChartJS } from 'chart.js'
import 'chart.js/auto'

import useAbbreviatedFormatter from '../../hooks/useAbbreviatedFormatter'

interface Props {
  label: string
  data: Record<string, number>
  unit?: string
  colors?: string[]
}

function createGradient(colors: string[], canvas: CanvasRenderingContext2D, area: ChartArea) {
  if (colors.length === 0) {
    throw new Error('No colors provided')
  }

  const colorsLength = colors.length
  const stops: number[] = [0]
  let count = colorsLength - 1

  while (count > 0) {
    stops.push(Math.round((1 / (colorsLength - 1)) * (colorsLength - count) * 100) / 100)
    count--
  }

  const gradient = canvas.createLinearGradient(0, area.bottom, 0, area.top)

  for (const idx in colors) {
    gradient.addColorStop(stops[idx], colors[idx])
  }

  return gradient
}

function LineChart({ label, data, unit, colors }: Props) {
  const intl = useIntl()
  const YAxisFormat = useAbbreviatedFormatter()
  const chartRef = useRef<ChartJS>(null)

  const configuration = useMemo(
    () => ({
      labels: Object.keys(data).map((label) => {
        const formattedLabel = label.concat('/01')
        const date = new Date(formattedLabel)
        return intl.formatDate(date, { year: 'numeric', month: 'short' })
      }),
      datasets: [
        {
          label,
          data: Object.values(data),
        },
      ],
    }),
    [label, data]
  )

  const options = {
    responsive: true,
    aspectRatio: 2.5,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: number | string) => YAxisFormat(Number(value)) + (unit ? ` ${unit}` : ''),
        },
        min: 0,
      },
    },
  }

  const [chartData, setChartData] = useState<ChartData<'line'>>(configuration)

  useEffect(() => {
    const chart = chartRef.current

    if (!chart) {
      return
    }

    const color = createGradient(colors || ['#FF2D55'], chart.ctx, chart.chartArea)

    const config = {
      ...configuration,
      datasets: configuration.datasets.map((dataset) => ({
        ...dataset,
        borderColor: color,
        backgroundColor: color,
      })),
    }

    setChartData(config)
  }, [chartRef, colors, configuration])

  return <Chart ref={chartRef} options={options} data={chartData} type="line" />
}

export default LineChart
