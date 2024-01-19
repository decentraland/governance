import { Card } from 'decentraland-ui/dist/components/Card/Card'

import Link from '../Common/Typography/Link'
import Text from '../Common/Typography/Text'
import Helper from '../Helper/Helper'
import ChevronRight from '../Icon/ChevronRight'
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
  href?: string
  helper?: string
}

function FinancialCard({ type, title, value, subtitle, href, helper }: Props) {
  return (
    <Card className="FinancialCard" as={href ? Link : undefined} href={href}>
      <div>
        <Text className="FinancialCard__Text FinancialCard__Text--upper" size="sm">
          {title}
          {helper && <Helper text={helper} size="16" position="bottom center" />}
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
      </div>
      {href && <ChevronRight />}
    </Card>
  )
}

export default FinancialCard
