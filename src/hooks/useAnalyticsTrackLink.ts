import { useCallback } from 'react'

import { isLocalLink, isMetaClick } from '../helpers/browser'
import { track } from '../utils/analytics'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (event: React.MouseEvent<any>, ...extra: any[]) => void | undefined | null | Record<string, any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMouseEventName(event: React.MouseEvent<any>) {
  const el = event.currentTarget as HTMLAnchorElement
  const dataset = el.dataset || {}
  return dataset.event || event.type.toLowerCase()
}

/** Returns all data associated with an element  */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMouseEventData(event: React.MouseEvent<any>) {
  const el: HTMLAnchorElement = event.currentTarget
  const dataset: Record<string, string | undefined> = el.dataset || {}
  const data = {
    location: location.toString(),
    text: el.innerText.trim() || el.title.trim(),
    rel: el.rel || undefined,
    target: el.target || undefined,
    href:
      el.getAttribute('href') ||
      el.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ||
      el.getAttribute('xlink:href') ||
      undefined,
  } as const

  return { ...dataset, ...data } as typeof data & typeof dataset
}

export default function useAnalyticsTrackLink<H extends Handler>(callback?: H, deps: React.DependencyList = []): H {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((event: React.MouseEvent<any>, ...extra: any[]) => {
      const name = getMouseEventName(event)
      const data = getMouseEventData(event)

      if (callback) {
        const aggregated = callback(event, ...extra)
        if (aggregated && typeof aggregated == 'object') {
          Object.assign(data, aggregated)
        }
      }

      if (!isLocalLink(data.href) && data.target === '_blank' && !isMetaClick(event) && !event.defaultPrevented) {
        event.preventDefault()
        track(name, data, () => {
          window.location.href = data.href!
        })
      } else {
        track(name, data)
      }
    }) as H,
    deps
  )
}
