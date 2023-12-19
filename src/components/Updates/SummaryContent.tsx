import { useIntl } from 'react-intl'

import { FinancialUpdateRecord } from '../../entities/Updates/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import Divider from '../Common/Divider'
import Text from '../Common/Typography/Text'
import LinkIcon from '../Icon/LinkIcon'

import './SummaryContent.css'

export interface SummaryContentProps {
  concept: string
  group: Omit<FinancialUpdateRecord, 'concept'>[]
}

function SummaryContent({ concept, group }: SummaryContentProps) {
  const { formatNumber } = useIntl()
  return (
    <>
      <Divider className="SummaryContentItem__Divider" />
      {group.map(({ amount, description, token_type, receiver, link }, index) => (
        <>
          <div key={`${concept}-${index}`} className="SummaryContentItem">
            <div className="SummaryContentItem_DescriptionContainer">
              <Text className="SummaryContentItem_DescriptionText" size="md">
                {description}
              </Text>
              <Text className="SummaryContentItem_DescriptionText" size="sm" color="secondary">
                {receiver}
              </Text>
            </div>
            <div className="SummaryContentItem_DetailsContainer">
              <span className="SummaryContentItem_TokenType">{token_type}</span>
              <span className="SummaryContentItem_Amount">{formatNumber(amount, CURRENCY_FORMAT_OPTIONS)}</span>
              <a href={link} target="_blank" rel="noreferrer">
                <LinkIcon color="var(--black-600)" />
              </a>
            </div>
          </div>
          <Divider className="SummaryContentItem__Divider" />
        </>
      ))}
    </>
  )
}

export default SummaryContent
