import DOMPurify from 'dompurify'

import { FORUM_URL } from '../../constants'
import { shortenText } from '../../helpers'
import useAbbreviatedFormatter from '../../hooks/useAbbreviatedFormatter'
import useDclProfile from '../../hooks/useDclProfile'
import useFormatMessage from '../../hooks/useFormatMessage'
import Time from '../../utils/date/Time'
import locations from '../../utils/locations'
import Avatar from '../Common/Avatar'
import DateTooltip from '../Common/DateTooltip'
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
  isValidated?: boolean
  extraInfo?: { choice: string; vp: number }
}

const CHOICE_MAX_LENGTH = 14

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Comment({
  forumUsername,
  avatarUrl,
  createdAt,
  cooked,
  address,
  isValidated,
  extraInfo,
}: Props) {
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
  const { profile, isLoadingDclProfile } = useDclProfile(address)
  const { username, hasCustomAvatar, avatarUrl: profileAvatarUrl } = profile

  const t = useFormatMessage()
  const formatter = useAbbreviatedFormatter()
  const isChoiceShortened = (extraInfo?.choice.length || 0) > CHOICE_MAX_LENGTH

  return (
    <div className="Comment">
      <div className="Comment__ProfileImage">
        <Link href={discourseUserUrl}>
          <Avatar
            address={address}
            avatar={hasCustomAvatar ? profileAvatarUrl : avatarUrl}
            size="md"
            isLoadingDclProfile={isLoadingDclProfile}
          />
        </Link>
      </div>
      <div className="Comment__Content">
        <div className="Comment__Author">
          <Link href={discourseUserUrl}>
            <Text className="Comment__AuthorText" weight="bold" as="span">
              {username || forumUsername}
              {address && isValidated && <ValidatedProfile />}
            </Text>
          </Link>
          {extraInfo && (
            <>
              <Text
                className="Comment__ExtraInfo Comment__ExtraInfo--choice"
                as="span"
                title={isChoiceShortened ? extraInfo.choice : undefined}
              >
                {t('page.rationale.vote_info', { choice: shortenText(extraInfo.choice, CHOICE_MAX_LENGTH) })}
              </Text>
              <Text className="Comment__ExtraInfo" weight="bold" as="span">
                {formatter(extraInfo.vp)} VP
              </Text>
              ,
            </>
          )}
          <DateTooltip date={Time(createdAt).toDate()}>
            <Text color="secondary" as="span">
              {Time.from(createdAt).fromNow()}
            </Text>
          </DateTooltip>
        </div>
        <div className="Comment__Cooked" dangerouslySetInnerHTML={createMarkup(cooked)} />
      </div>
    </div>
  )
}
