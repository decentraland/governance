import { Fragment, useState } from 'react'

import classNames from 'classnames'
import toNumber from 'lodash/toNumber'
import type { AccordionTitleProps } from 'semantic-ui-react'
import Accordion from 'semantic-ui-react/dist/commonjs/modules/Accordion/Accordion'

import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'

import './BreakdownAccordion.css'

const UNSELECTED_ITEM = -1

export interface BreakdownItem<T> {
  title: string
  subtitle: string
  value?: string
  contentProps: T
  content: (props: T) => React.ReactNode
}

interface Props<T> {
  items: BreakdownItem<T>[]
}

function BreakdownAccordion<T>({ items }: Props<T>) {
  const [activeAccordionItem, setActiveAccordionItem] = useState(UNSELECTED_ITEM)

  const handleClick = (titleProps: AccordionTitleProps) => {
    const { index } = titleProps
    const selectedAccordion = toNumber(index)

    setActiveAccordionItem(selectedAccordion === activeAccordionItem ? UNSELECTED_ITEM : selectedAccordion)
  }

  return (
    <Accordion fluid styled className="BreakdownAccordion">
      {items.map(({ title, subtitle, value, content, contentProps }, accordionNumber) => (
        <Fragment key={`BreakdownAccordionItem--${accordionNumber}`}>
          <Accordion.Title
            className="BreakdownAccordion__TitleContainer"
            active={activeAccordionItem === accordionNumber}
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
                    activeAccordionItem === accordionNumber && 'BreakdownAccordion__Arrow--selected'
                  )}
                />
              </span>
            </div>
          </Accordion.Title>
          <Accordion.Content active={activeAccordionItem === accordionNumber}>
            {content(contentProps)}
          </Accordion.Content>
        </Fragment>
      ))}
    </Accordion>
  )
}

export default BreakdownAccordion
