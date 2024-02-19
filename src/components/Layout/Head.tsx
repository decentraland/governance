import { Helmet, HelmetProps } from 'react-helmet'

import { DCL_META_IMAGE_URL, GOVERNANCE_URL } from '../../constants'
import { isLocalLink } from '../../helpers/browser'

// TODO: Review how this data is built in non-gatsby DCL apps for consistency.

type Props = {
  title?: string
  description?: string
  image?: string
  children?: React.ReactNode
  links?: HelmetProps['link']
}

function getAbsoluteUrls(linkProps?: HelmetProps['link']) {
  if (linkProps === undefined) return undefined
  return linkProps.map((props) => {
    const href = props.href
    if (href === undefined) return props
    return isLocalLink(href) ? { ...props, href: `${GOVERNANCE_URL}${href}` } : props
  })
}

export default function Head({ title, description, image, children, links }: Props) {
  const meta: Record<string, string> = {
    'og:title': title || '',
    'twitter:title': title || '',
    'og:description': description || '',
    'twitter:description': description || '',
    'og:image': image || DCL_META_IMAGE_URL,
    'twitter:image': image || '',
    'twitter:card': 'summary',
  }

  const metaKeys = Object.keys(meta).filter((name) => Boolean(meta[name]))
  const absoluteLinks = getAbsoluteUrls(links)

  return (
    <Helmet htmlAttributes={{ lang: 'en' }} link={absoluteLinks}>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {image && <meta name="image" content={image} />}
      {metaKeys.map((name) => {
        if (name.startsWith('og:')) {
          return <meta key={name} property={name} content={meta[name]?.toString()} />
        }

        return <meta key={name} name={name} content={meta[name]?.toString()} />
      })}
      {children}
    </Helmet>
  )
}

Head.defaultProps = {
  meta: {},
}
