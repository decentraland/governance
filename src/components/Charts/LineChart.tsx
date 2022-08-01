import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Chart } from 'react-chartjs-2'

import {
  CategoryScale,
  ChartArea,
  ChartData,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'

interface Props {
  label: string
  data: Record<string, number>
  unit?: string
  colors?: string[]
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

function createGradient(colors: string[], ctx: CanvasRenderingContext2D, area: ChartArea) {
  if (!colors) {
    throw new Error('No colors provided')
  }

  const colorsLength = colors.length
  let stops: number[] = []
  let count = colorsLength - 1

  while (count > 0) {
    stops = [Math.round((1 / (colorsLength - 1)) * count * 100) / 100, ...stops]
    count--
  }

  stops = [0, ...stops]

  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top)

  for (const idx in colors) {
    gradient.addColorStop(stops[idx], colors[idx])
  }

  return gradient
}

function LineChart({ label, data, unit, colors }: Props) {
  const intl = useIntl()
  const chartRef = useRef<ChartJS>(null)

  const YAxisFormat = (value: number) => {
    if (value < 0) {
      return String(value)
    }

    const lookup = [
      { magnitude: 1, abv: '' },
      { magnitude: 1e3, abv: 'k' },
      { magnitude: 1e6, abv: 'M' },
      { magnitude: 1e9, abv: 'G' },
      { magnitude: 1e12, abv: 'T' },
      { magnitude: 1e15, abv: 'P' },
      { magnitude: 1e18, abv: 'E' },
    ]
    const magnitudes = lookup.map((obj) => obj.magnitude)
    const valueMag = 10 ** Math.floor(Math.log10(value))
    const diffArr = magnitudes.map((x) => Math.abs(valueMag - x))
    const minNumber = Math.min(...diffArr)
    const idx = diffArr.findIndex((x) => x === minNumber)

    return `${intl.formatNumber(value / lookup[idx].magnitude)}${lookup[idx].abv}`
  }

  const configuration = useMemo(
    () => ({
      labels: Object.keys(data).map((label) => intl.formatDate(new Date(label), { year: 'numeric', month: 'short' })),
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
