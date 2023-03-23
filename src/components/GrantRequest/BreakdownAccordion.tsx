import React, { Fragment, useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import toNumber from 'lodash/toNumber'
import type { AccordionTitleProps } from 'semantic-ui-react'
import Accordion from 'semantic-ui-react/dist/commonjs/modules/Accordion/Accordion'

import { isHttpsURL } from '../../helpers'
import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'
import Open from '../Icon/Open'

import './BreakdownAccordion.css'

const UNSELECTED_ITEM = -1

export interface BreakdownItem {
  title: string
  subtitle: string
  description: string
  url?: string
  value?: string
}

interface Props {
  items: BreakdownItem[]
}

const formatUrl = (url: string) => (isHttpsURL(url) ? url : `//${url}`)

function BreakdownAccordion({ items }: Props) {
  const [activeAccordionItem, setActiveAccordionItem] = useState(UNSELECTED_ITEM)
  const t = useFormatMessage()

  const handleClick = (titleProps: AccordionTitleProps) => {
    const { index } = titleProps
    const selectedAccordion = toNumber(index)

    setActiveAccordionItem(selectedAccordion === activeAccordionItem ? UNSELECTED_ITEM : selectedAccordion)
  }

  return (
    <Accordion fluid styled className="BreakdownAccordion">
      {items.map(({ title, subtitle, description, url, value }, accordionNumber) => (
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
                  className={TokenList.join([
                    'BreakdownAccordion__Arrow',
                    activeAccordionItem === accordionNumber && 'BreakdownAccordion__Arrow--selected',
                  ])}
                />
              </span>
            </div>
          </Accordion.Title>
          <Accordion.Content active={activeAccordionItem === accordionNumber}>
            <p>{description}</p>
            {url && (
              <a href={formatUrl(url)} target="_blank" rel="noopener noreferrer" className="BreakdownAccordion__Link">
                {t('page.proposal_view.grant.relevant_link')} <Open />
              </a>
            )}
          </Accordion.Content>
        </Fragment>
      ))}
    </Accordion>
  )
}

export default BreakdownAccordion
