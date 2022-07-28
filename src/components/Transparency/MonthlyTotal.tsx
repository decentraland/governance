import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { MonthlyTotal } from '../../api/DclData'
import { formatBalance } from '../../entities/Proposal/utils'
import { DetailItem } from '../Section/DetailItem'

import './MonthlyTotal.css'

export type MonthlyTotalProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string
  monthlyTotal: MonthlyTotal
  invertDiffColors?: boolean
}

enum Color {
  RED = 'Number--Red',
  GREEN = 'Number--Green',
}

enum DetailsVisibility {
  OVERVIEW = 'MonthlyTotal--Overview',
  FULL = 'MonthlyTotal--Full',
}

const MAX_TAGS = 5

export default React.memo(function MonthlyTotal({ title, monthlyTotal, invertDiffColors = false }: MonthlyTotalProps) {
  const t = useFormatMessage()
  const [belowZeroColor, zeroOrOverColor] = invertDiffColors ? [Color.GREEN, Color.RED] : [Color.RED, Color.GREEN]
  const [detailsVisibility, setDetailsVisibility] = useState(DetailsVisibility.OVERVIEW)

  const handleButtonClick = () => {
    detailsVisibility === DetailsVisibility.OVERVIEW
      ? setDetailsVisibility(DetailsVisibility.FULL)
      : setDetailsVisibility(DetailsVisibility.OVERVIEW)
  }

  return (
    <div className={TokenList.join(['MonthlyTotal', detailsVisibility])}>
      <Card>
        <Card.Content className="MonthlyTotal_Headers">
          <div>
            <Header className="MonthlyTotal__Header">{title}</Header>
            <Header size="huge" className="MonthlyTotal__Header">
              ${formatBalance(monthlyTotal.total)}
              <Header size="small">USD</Header>
            </Header>
            <Header sub className="MonthlyTotal__Sub">
              <strong
                className={TokenList.join([
                  'Number',
                  monthlyTotal.previous < 0 && belowZeroColor,
                  monthlyTotal.previous >= 0 && zeroOrOverColor,
                ])}
              >
                {formatBalance(monthlyTotal.previous) + '% '}
              </strong>
              {t('page.transparency.mission.diff_label')}
            </Header>
          </div>
        </Card.Content>
        <Card.Content className={TokenList.join(['MonthlyTotal__Detail', detailsVisibility])}>
          <div className="ItemsList">
            {monthlyTotal.details &&
              monthlyTotal.details.map((detail, index) => {
                return (
                  <DetailItem
                    key={['incomeDetail', index].join('::')}
                    name={detail.name}
                    value={'$' + formatBalance(detail.value)}
                    description={detail.description}
                  />
                )
              })}
          </div>
        </Card.Content>
        {monthlyTotal.details.length > MAX_TAGS && (
          <Button basic onClick={handleButtonClick}>
            {detailsVisibility === DetailsVisibility.OVERVIEW
              ? t('page.transparency.funding.view_more', { count: monthlyTotal.details.length - MAX_TAGS })
              : t('modal.vp_delegation.details.show_less')}
          </Button>
        )}
      </Card>
    </div>
  )
})
