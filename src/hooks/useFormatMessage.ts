import { PrimitiveType, useIntl } from 'react-intl'

function useFormatMessage() {
  const intl = useIntl()
  return (id?: string, values?: Record<string, PrimitiveType>) => {
    if (!id || id.length === 0) return ''
    return intl.formatMessage({ id }, values)
  }
}

export default useFormatMessage
