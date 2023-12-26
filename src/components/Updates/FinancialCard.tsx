import { useIntl } from 'react-intl'

import { Card } from 'decentraland-ui/dist/components/Card/Card'

import { CURRENCY_FORMAT_OPTIONS } from '../../helpers'
import Text from '../Common/Typography/Text'
import IncomeArrow from '../Icon/IncomeArrow'
import OutcomeArrow from '../Icon/OutcomeArrow'

import './FinancialCard.css'

enum FinancialCardType {
  Income = 'income',
  Outcome = 'outcome',
}

interface Props {
  type: `${FinancialCardType}`
  title: string
  value: number
  subtitle?: string
}

function FinancialCard({ type, title, value, subtitle }: Props) {
  const { formatNumber } = useIntl()
  return (
    <Card className="FinancialCard">
      <Text className="FinancialCard__Text" size="sm">
        {title}
      </Text>
      <div className="FinancialCard__Value">
        {type === FinancialCardType.Income ? <IncomeArrow /> : <OutcomeArrow />}
        <Text className="FinancialCard__Text" size="xl">
          {formatNumber(value, CURRENCY_FORMAT_OPTIONS)}
        </Text>
      </div>
      {subtitle && (
        <Text className="FinancialCard__Text" size="sm" weight="semi-bold">
          {subtitle}
        </Text>
      )}
    </Card>
  )
}

export default FinancialCard
