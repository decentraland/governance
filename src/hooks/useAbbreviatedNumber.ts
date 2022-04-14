import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

export default function useAbbreviatedNumber(value: number) {
  const l = useFormatMessage()

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

  return `${l(`general.number`, { value: value / lookup[idx].magnitude })}${lookup[idx].abv}`
}
