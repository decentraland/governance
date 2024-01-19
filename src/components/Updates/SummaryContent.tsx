import { Fragment } from 'react'
import { useIntl } from 'react-intl'

import classNames from 'classnames'
import { useMobileMediaQuery } from 'decentraland-ui/dist/components/Media/Media'

import { FinancialRecord, FinancialRecordCateogry } from '../../entities/Updates/types'
import { CURRENCY_FORMAT_OPTIONS, addressShortener } from '../../helpers'
import Divider from '../Common/Divider'
import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import LinkIcon from '../Icon/LinkIcon'

import './SummaryContent.css'

export interface SummaryContentProps {
  category: FinancialRecordCateogry
  group: Omit<FinancialRecord, 'category'>[]
}

function SummaryContent({ category, group }: SummaryContentProps) {
  const { formatNumber } = useIntl()
  const isMobile = useMobileMediaQuery()

  return (
    <>
      <Divider className="SummaryContentItem__Divider" />
      {group.map(({ amount, description, token, receiver, link }, index) => (
        <Fragment key={`${category}-${index}`}>
          <div className="SummaryContentItem">
            <div className="SummaryContentItem_DescriptionContainer">
              <Text
                className="SummaryContentItem_DescriptionText"
                size="md"
                ref={(element) => {
                  element?.addEventListener('mouseover', () => {
                    const { scrollWidth: elementWidth, clientWidth: containerWidth } = element
                    if (elementWidth > containerWidth) {
                      element.setAttribute('title', description)
                    }
                  })
                }}
              >
                {description}
              </Text>
              <Text size="sm" color="secondary">
                {isMobile ? addressShortener(receiver) : receiver}
              </Text>
            </div>
            <div className="SummaryContentItem_DetailsContainer">
              <span className="SummaryContentItem_Token">{token}</span>
              <span className="SummaryContentItem_Amount">{formatNumber(amount, CURRENCY_FORMAT_OPTIONS)}</span>
              <Link href={link} className={classNames(!link && 'SummaryContentItem_Link--hidden')}>
                <LinkIcon color="var(--black-600)" />
              </Link>
            </div>
          </div>
          <Divider className="SummaryContentItem__Divider" />
        </Fragment>
      ))}
    </>
  )
}

export default SummaryContent
