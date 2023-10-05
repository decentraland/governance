import React, { useState } from 'react'

import classNames from 'classnames'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { MonthlyTotal as MonthlyTotalType } from '../../clients/DclData'
import { formatBalance } from '../../entities/Proposal/utils'
import useFormatMessage from '../../hooks/useFormatMessage'
import { DetailItem } from '../Proposal/View/DetailItem'

import ItemsList from './ItemsList'
import './MonthlyTotal.css'

enum Color {
  RED = 'Number--Red',
  GREEN = 'Number--Green',
}

enum DetailsVisibility {
  OVERVIEW = 'MonthlyTotal--Overview',
  FULL = 'MonthlyTotal--Full',
}

const MAX_TAGS = 5

type Props = React.HTMLAttributes<HTMLDivElement> & {
  title: string
  monthlyTotal: MonthlyTotalType
  invertDiffColors?: boolean
}

export default function MonthlyTotal({ title, monthlyTotal, invertDiffColors = false }: Props) {
  const t = useFormatMessage()
  const [belowZeroColor, zeroOrOverColor] = invertDiffColors ? [Color.GREEN, Color.RED] : [Color.RED, Color.GREEN]
  const [detailsVisibility, setDetailsVisibility] = useState(DetailsVisibility.OVERVIEW)

  const handleButtonClick = () => {
    detailsVisibility === DetailsVisibility.OVERVIEW
      ? setDetailsVisibility(DetailsVisibility.FULL)
      : setDetailsVisibility(DetailsVisibility.OVERVIEW)
  }

  return (
    <div className={classNames('MonthlyTotal', detailsVisibility)}>
      <Card className="MonthlyTotal__Card">
        <Card.Content className="MonthlyTotal_Headers">
          <div>
            <Header className="MonthlyTotal__Header">{title}</Header>
            <Header size="huge" className="MonthlyTotal__Header">
              ${formatBalance(monthlyTotal.total)}
              <Header size="small">USD</Header>
            </Header>
            <Header sub className="MonthlyTotal__Sub">
              <strong
                className={classNames(
                  'Number',
                  monthlyTotal.previous < 0 && belowZeroColor,
                  monthlyTotal.previous >= 0 && zeroOrOverColor
                )}
              >
                {formatBalance(monthlyTotal.previous) + '% '}
              </strong>
              {t('page.transparency.mission.diff_label')}
            </Header>
          </div>
        </Card.Content>
        <Card.Content className={classNames('MonthlyTotal__Detail', detailsVisibility)}>
          <ItemsList>
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
          </ItemsList>
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
}
