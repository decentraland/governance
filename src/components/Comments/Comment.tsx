import DOMPurify from 'dompurify'

import { FORUM_URL } from '../../constants'
import useDclProfile from '../../hooks/useDclProfile'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import Avatar from '../Common/Avatar'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import ValidatedProfile from '../Icon/ValidatedProfile'

import './Comment.css'

function getDiscourseProfileUrl(user: string, address?: string) {
  return address ? locations.profile({ address }) : `${FORUM_URL}/u/${user}`
}

type Props = {
  forumUsername: string
  avatarUrl: string
  createdAt: string
  cooked?: string
  address?: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Comment({ forumUsername, avatarUrl, createdAt, cooked, address }: Props) {
  const createMarkup = (html: any) => {
    DOMPurify.addHook('afterSanitizeAttributes', function (node) {
      if (node.nodeName && node.nodeName === 'IMG' && node.getAttribute('alt') === 'image') {
        node.className = 'Comment__CookedImg'
      }

      const hrefAttribute = node.getAttribute('href')
      if (node.nodeName === 'A' && hrefAttribute?.includes('/u/') && node.className === 'mention') {
        const newHref = getDiscourseProfileUrl(hrefAttribute?.split('/u/')[1])
        node.setAttribute('href', newHref)
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
      }
    })

    const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
    return { __html: clean }
  }

  const discourseUserUrl = getDiscourseProfileUrl(forumUsername, address)
  const { username, avatar, hasCustomAvatar, isLoadingDclProfile } = useDclProfile(address)
  const linkTarget = address ? undefined : '_blank'
  const linkRel = address ? undefined : 'noopener noreferrer'

  return (
    <div className="Comment">
      <div className="Comment__ProfileImage">
        <Link href={discourseUserUrl} target={linkTarget} rel={linkRel}>
          {hasCustomAvatar ? (
            <Avatar address={address} avatar={avatar} size="medium" isLoadingDclProfile={isLoadingDclProfile} />
          ) : (
            <Avatar size="medium" src={avatarUrl} />
          )}
        </Link>
      </div>
      <div className="Comment__Content">
        <div className="Comment__Author">
          <Link href={discourseUserUrl} target={linkTarget} rel={linkRel}>
            <Text weight="bold">
              {username ? username : forumUsername}
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
