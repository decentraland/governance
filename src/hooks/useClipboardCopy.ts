import { useCallback, useEffect, useState } from 'react'

import clipboardCopy from 'clipboard-copy'

export default function useClipboardCopy(timeout?: number) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  const handleCopy = useCallback((value: unknown) => {
    const copiedValue = String(value ?? '')
    clipboardCopy(copiedValue)
    setCopiedValue(copiedValue)
  }, [])

  const clear = useCallback(() => setCopiedValue(null), [])

  useEffect(() => {
    let copyTimeout: null | ReturnType<typeof setTimeout> = null
    if (copiedValue && timeout && timeout > 0) {
      copyTimeout = setTimeout(() => clear(), timeout)
    }

    return () => {
      if (copyTimeout) {
        clearTimeout(copyTimeout)
      }
    }
  }, [clear, copiedValue, timeout])

  return {
    copiedValue,
    handleCopy,
    clear,
  }
}
