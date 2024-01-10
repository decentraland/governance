import { Card } from 'decentraland-ui/dist/components/Card/Card'

import Text from '../Common/Typography/Text'
import IncomeArrow from '../Icon/IncomeArrow'
import OutcomeArrow from '../Icon/OutcomeArrow'

import './FinancialCard.css'

enum FinancialCardType {
  Income = 'income',
  Outcome = 'outcome',
}

interface Props {
  type?: `${FinancialCardType}`
  title: string
  value: string
  subtitle?: string
}

function FinancialCard({ type, title, value, subtitle }: Props) {
  return (
    <Card className="FinancialCard">
      <Text className="FinancialCard__Text FinancialCard__Text--upper" size="sm">
        {title}
      </Text>
      <div className="FinancialCard__Value">
        {type && (type === FinancialCardType.Income ? <IncomeArrow /> : <OutcomeArrow />)}
        <Text className="FinancialCard__Text" size="xl">
          {value}
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
