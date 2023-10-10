import DOMPurify from 'dompurify'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { FORUM_URL } from '../../constants'
import useProfile from '../../hooks/useProfile'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import Avatar from '../Common/Avatar'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import ValidatedProfile from '../Icon/ValidatedProfile'

import './Comment.css'

function getUserProfileUrl(user: string, address?: string) {
  return address ? locations.profile({ address }) : `${FORUM_URL}/u/${user}`
}

type Props = {
  user: string
  avatarUrl: string
  createdAt: string
  cooked?: string
  address?: string
}

export default function Comment({ user, avatarUrl, createdAt, cooked, address }: Props) {
  const createMarkup = (html: any) => {
    DOMPurify.addHook('afterSanitizeAttributes', function (node) {
      if (node.nodeName && node.nodeName === 'IMG' && node.getAttribute('alt') === 'image') {
        node.className = 'Comment__CookedImg'
      }

      const hrefAttribute = node.getAttribute('href')
      if (node.nodeName === 'A' && hrefAttribute?.includes('/u/') && node.className === 'mention') {
        const newHref = getUserProfileUrl(hrefAttribute?.split('/u/')[1])
        node.setAttribute('href', newHref)
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
      }
    })

    const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
    return { __html: clean }
  }

  const discourseUserUrl = getUserProfileUrl(user, address)
  const { displayableAddress } = useProfile(address)
  const linkTarget = address ? undefined : '_blank'
  const linkRel = address ? undefined : 'noopener noreferrer'

  return (
    <div className="Comment">
      <div className="Comment__ProfileImage">
        <Link href={discourseUserUrl} target={linkTarget} rel={linkRel}>
          {address ? <Avatar address={address} size="medium" /> : <Avatar size="medium" src={avatarUrl} />}
        </Link>
      </div>
      <div className="Comment__Content">
        <div className="Comment__Author">
          <Link href={discourseUserUrl} target={linkTarget} rel={linkRel}>
            <Text weight="bold">
              {displayableAddress && !isEthereumAddress(displayableAddress) ? displayableAddress : user}
              {address && <ValidatedProfile />}
            </Text>
          </Link>
          <span>
            <Text color="secondary">{Time.from(createdAt).fromNow()}</Text>
          </span>
        </div>
        <div className="Comment__Cooked" dangerouslySetInnerHTML={createMarkup(cooked)} />
      </div>
    </div>
  )
}
