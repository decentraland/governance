import useFormatMessage from './useFormatMessage'

export default function useAbbreviatedFormatter() {
  const t = useFormatMessage()

  const formatter = (value: number) => {
    const sign = value < 0 ? -1 : 1
    value = Math.abs(value)

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

    return `${t('general.number', { value: sign * (Math.round((value / lookup[idx].magnitude) * 100) / 100) })}${
      lookup[idx].abv
    }`
  }

  return formatter
}
