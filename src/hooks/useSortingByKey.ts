import { useMemo, useState } from 'react'

export function useSortingByKey<T>(list: T[], key: string) {
  const [isDescending, setIsDescending] = useState(true)

  const sorted = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => (list ? list.sort((a: any, b: any) => (isDescending ? b[key] - a[key] : a[key] - b[key])) : []),
    [list, isDescending, key]
  )

  return {
    sorted,
    isDescendingSort: isDescending,
    changeSort: () => setIsDescending((prev) => !prev),
    setIsDescending,
  }
}
