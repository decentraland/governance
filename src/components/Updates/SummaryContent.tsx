import { UpdateFinancialRecord } from '../../entities/Updates/types'

export interface SummaryContentProps {
  group: Omit<UpdateFinancialRecord, 'concept'>[]
}

function SummaryContent({ group }: SummaryContentProps) {
  return <div>{group.length}</div>
}

export default SummaryContent
