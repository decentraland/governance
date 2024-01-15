import Helmet, { HelmetProps } from 'react-helmet'

import DclHead, { HeadProps } from 'decentraland-gatsby/dist/components/Head/Head'

import { isLocalLink } from '../../clients/utils'
import { GOVERNANCE_URL } from '../../constants'

type Props = Partial<HeadProps> & HelmetProps

function setAbsoluteUrl(links?: HelmetProps['link']) {
  if (!links) return undefined
  return links.map((link) => {
    const href = link.href
    if (!href) return link
    return isLocalLink(href) ? { ...link, href: `${GOVERNANCE_URL}${href}` } : link
  })
}

function Head({ lang, title, titleTemplate, defaultTitle, description, image, meta, link, ...props }: Props) {
  const absoluteLink = setAbsoluteUrl(link)
  return (
    <>
      <DclHead
        lang={lang}
        title={title}
        titleTemplate={titleTemplate}
        defaultTitle={defaultTitle}
        description={description}
        image={image}
        meta={meta}
      />
      <Helmet {...props} link={absoluteLink} />
    </>
  )
}

export default Head
