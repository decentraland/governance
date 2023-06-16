import React from 'react'

import Avatar from 'decentraland-gatsby/dist/components/User/Avatar'
import { Link } from 'decentraland-gatsby/dist/plugins/intl'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import DOMPurify from 'dompurify'
import isEthereumAddress from 'validator/lib/isEthereumAddress'

import { getUserProfileUrl } from '../../../entities/User/utils'
import useProfile from '../../../hooks/useProfile'
import Text from '../../Common/Text/Text'
import ValidatedProfile from '../../Icon/ValidatedProfile'

import './ProposalComment.css'

type Props = {
  user: string
  avatarUrl: string
  createdAt: string
  cooked?: string
  address?: string
}

export default function ProposalComment({ user, avatarUrl, createdAt, cooked, address }: Props) {
  const createMarkup = (html: any) => {
    DOMPurify.addHook('afterSanitizeAttributes', function (node) {
      if (node.nodeName && node.nodeName === 'IMG' && node.getAttribute('alt') === 'image') {
        node.className = 'ProposalComment__Cooked__Img'
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
    <div className="ProposalComment">
      <div className="ProposalComment__ProfileImage">
        <Link href={discourseUserUrl} target={linkTarget} rel={linkRel}>
          {address ? <Avatar address={address} size="medium" /> : <Avatar size="medium" src={avatarUrl} />}
        </Link>
      </div>
      <div className="ProposalComment__Content">
        <div className="ProposalComment__Author">
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
        <div className="ProposalComment__Cooked" dangerouslySetInnerHTML={createMarkup(cooked)} />
      </div>
    </div>
  )
}
