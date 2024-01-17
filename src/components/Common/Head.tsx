import Helmet, { HelmetProps } from 'react-helmet'

import DclHead, { HeadProps } from 'decentraland-gatsby/dist/components/Head/Head'

import { isLocalLink } from '../../clients/utils'
import { GOVERNANCE_URL } from '../../constants'

type Props = Partial<HeadProps> & HelmetProps

function getAbsoluteUrls(linkProps?: HelmetProps['link']) {
  if (!linkProps) return undefined
  return linkProps.map((props) => {
    const href = props.href
    if (!href) return props
    return isLocalLink(href) ? { ...props, href: `${GOVERNANCE_URL}${href}` } : props
  })
}

function Head({ lang, title, titleTemplate, defaultTitle, description, image, meta, link, ...props }: Props) {
  const absoluteLinks = getAbsoluteUrls(link)
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
      <Helmet {...props} link={absoluteLinks} />
    </>
  )
}

export default Head
