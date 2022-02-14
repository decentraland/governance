import React from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { MonthlyTotal } from '../../api/DclData'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import './MonthlyTotal.css'
import { DetailItem } from '../Section/DetailItem'
import { formatBalance } from '../../entities/Proposal/utils'

export type MonthlyTotalProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string
  monthlyTotal: MonthlyTotal
}

export default React.memo(function MonthlyTotal({title, monthlyTotal }: MonthlyTotalProps) {
  const l = useFormatMessage()

  return <div className="MonthlyTotal">
    <Card>
      <Card.Content>
        <div>
          <Header className="MonthlyTotal__Header">{title}</Header>
          <Header size="huge" className="MonthlyTotal__Header">
            ${formatBalance(monthlyTotal.total)}
            <Header size="small" >USD</Header>
          </Header>
          <Header sub className="MonthlyTotal__Sub">
            <strong className={TokenList.join([
              'Number',
              monthlyTotal.previous < 0 && `Number--Red`,
              monthlyTotal.previous >= 0 && `Number--Green`])}>
              {formatBalance(monthlyTotal.previous) + "% "}
            </strong>
            {l('page.transparency.mission.diff_label')}
          </Header>
        </div>
      </Card.Content>
      <Card.Content className="MonthlyTotal__Detail">
        <div className="ItemsList">
          {monthlyTotal.details && monthlyTotal.details.map((detail, index) => {
            return <DetailItem
              key={['incomeDetail', index].join('::')}
              name={detail.name}
              value={'$' + formatBalance(detail.value)}
            />
          })}
        </div>
      </Card.Content>
    </Card>
  </div>
})
