import { Badge as GovernanceBadge } from '../../../entities/Badges/types'
import { POLYGONSCAN_BASE_URL } from '../../../entities/Transparency/utils'
import useFormatMessage from '../../../hooks/useFormatMessage'
import Time from '../../../utils/date/Time'
import Link from '../../Common/Typography/Link'
import Markdown from '../../Common/Typography/Markdown'

import Badge, { BadgeVariant } from './Badge'
import './BadgeDetail.css'

interface Props {
  badge: GovernanceBadge
}

function addNewLinesAfterFirstDot(text: string): string {
  const urlRegex = /https?:\/\/[^\s)]+/g

  let dotIndex = text.indexOf('.')
  let match: RegExpExecArray | null = null

  while ((match = urlRegex.exec(text)) !== null) {
    if (dotIndex > match.index && dotIndex < match.index + match[0].length) {
      dotIndex = text.indexOf('.', match.index + match[0].length)
    }
  }

  if (dotIndex === -1) return text

  const firstPart = text.substring(0, dotIndex + 1)
  const secondPart = text.substring(dotIndex + 1)
  return `${firstPart}\n\n${secondPart}`
}

function getPolygonscanTxLink(txHash: string) {
  return POLYGONSCAN_BASE_URL + 'tx/' + txHash
}

export default function BadgeDetail({ badge }: Props) {
  const t = useFormatMessage()

  return (
    <div className="BadgeDetail__Container">
      <Badge badge={badge} variant={BadgeVariant.Primary} iconClassName="BadgeDetail__Icon" />
      <div className="BadgeDetail__Info">
        <div className="BadgeDetail__Title">{badge.name}</div>
        <div className="BadgeDetail__MintDate">
          {t('component.badge_card.mint_date', { at: Time.unix(badge.createdAt).fromNow() })}
        </div>
      </div>
      <Markdown className="BadgeDetail__Description">{addNewLinesAfterFirstDot(badge.description)}</Markdown>
      <Link
        href={getPolygonscanTxLink(badge.transactionHash)}
        target="_blank"
        rel="noreferrer"
        className="BadgeDetail__TxLink"
      >
        {t('component.badge_card.polygonscan_link')}
      </Link>
    </div>
  )
}
