export function scrollToAnchor(anchor: string, pixelsOverAnchor = 0) {
  if (typeof window === 'undefined') return
  const element = document.getElementById(anchor)
  if (element) {
    const bounding = element.getBoundingClientRect()
    const position = bounding.top + window.scrollY - pixelsOverAnchor
    window.scrollTo({
      top: position,
      behavior: 'smooth',
    })
  }
}

export function toGovernancePathname(pathname: string) {
  if (pathname.indexOf('/governance') === 0) {
    return pathname.replace('/governance', '')
  }

  return pathname
}

export function isMetaClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey
}

export function isLocalLink(href?: string | null) {
  return (
    typeof href === 'string' && !href.startsWith('https://') && !href.startsWith('http://') && !href.startsWith('//')
  )
}
