export function params(options?: Record<string, any>) {
  if (!options) {
    return ''
  }

  let p = new URLSearchParams(
    Object.entries(options).filter(([, value]) => value !== undefined)
  ).toString()
  if (!p) {
    return ''
  }

  return '?' + p
}

type Value = string | boolean | number

type Options = {
  validate?: (value: string) => boolean
}

export function getBooleanParam(value?: Value) {
  switch (value) {
    case 'TRUE':
    case 'True':
    case 'true':
    case true:
    case '1':
    case 1:
      return true

    case 'FALSE':
    case 'False':
    case 'false':
    case false:
    case '0':
    case 0:
      return false

    default:
      return undefined
  }
}

export function getNumberParam (value?: Value, options: Options = {}) {
  if (typeof value === 'number') {
    return applyOptions(value, options)
  }

  if (value && !Number.isNaN(Number(value))) {
    return applyOptions(Number(value), options)
  }

  return undefined
}

export function getStringParam(value?: Value, options: Options = {}) {
  switch (typeof value) {
    case 'string':
      return applyOptions(value, options) || undefined
    case 'number':
      return applyOptions(String(value), options)
    default:
      return undefined
  }
}

export function getEnumParam<T extends Value>(value?: Value, values: T[] = []): T | undefined {
  return values.find(option => option === value)
}

export function applyOptions(value: any, options: Options = {}) {
  if (options.validate && !options.validate(value)) {
    return undefined
  }

  return value
}

export function formatParams(params: Record<string, Value | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined))
}
