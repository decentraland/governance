import { useCallback } from 'react'
import { useIntl } from 'react-intl'

// eslint-disable-next-line @typescript-eslint/ban-types
export type FormatMessageFunction = <V extends {}>(id?: string | null, values?: V | undefined) => string

function useFormatMessage() {
  const intl = useIntl()
  return useCallback(
    // eslint-disable-next-line @typescript-eslint/ban-types
    function format<V extends {}>(id?: string | null, values?: V) {
      if (!id || !intl.messages[id]) {
        return id || ''
      }

      return intl.formatMessage({ id }, { ...values })
    },
    [intl]
  )
}

export default useFormatMessage
