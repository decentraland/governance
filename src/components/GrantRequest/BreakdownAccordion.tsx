import { Fragment, useState } from 'react'

import classNames from 'classnames'
import toNumber from 'lodash/toNumber'
import type { AccordionTitleProps } from 'semantic-ui-react'
import Accordion from 'semantic-ui-react/dist/commonjs/modules/Accordion/Accordion'

import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'

import './BreakdownAccordion.css'

export interface BreakdownItem {
  title: string
  subtitle: string
  value?: string
  content: React.ReactNode
}

interface Props {
  items: BreakdownItem[]
  itemsInitiallyExpanded?: boolean
}

function BreakdownAccordion({ items, itemsInitiallyExpanded = false }: Props) {
  const [itemStatus, setItemStatus] = useState(new Array<boolean>(items.length).fill(itemsInitiallyExpanded))

  const handleClick = (titleProps: AccordionTitleProps) => {
    const { index } = titleProps
    const selectedAccordion = toNumber(index)

    setItemStatus((status) => {
      const prevItemStatus = status[selectedAccordion]
      const newStatus = [...status]
      newStatus[selectedAccordion] = !prevItemStatus
      return newStatus
    })
  }

  return (
    <Accordion fluid styled className="BreakdownAccordion">
      {items.map(({ title, subtitle, value, content }, accordionNumber) => (
        <Fragment key={`BreakdownAccordionItem--${accordionNumber}`}>
          <Accordion.Title
            className="BreakdownAccordion__TitleContainer"
            active={itemStatus[accordionNumber]}
            index={accordionNumber}
            onClick={(_, titleProps) => handleClick(titleProps)}
          >
            <div>
              <div className="BreakdownAccordion__Title">{title}</div>
              <div className="BreakdownAccordion__Subtitle">{subtitle}</div>
            </div>
            <div className="BreakdownAccordion__SizeContainer">
              {value && <span>{value}</span>}
              <span>
                <ChevronRightCircleOutline
                  className={classNames(
                    'BreakdownAccordion__Arrow',
                    itemStatus[accordionNumber] && 'BreakdownAccordion__Arrow--selected'
                  )}
                />
              </span>
            </div>
          </Accordion.Title>
          <Accordion.Content active={itemStatus[accordionNumber]}>{content}</Accordion.Content>
        </Fragment>
      ))}
    </Accordion>
  )
}

export default BreakdownAccordion
