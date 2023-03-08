import React, { useState } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import toNumber from 'lodash/toNumber'
import type { AccordionTitleProps } from 'semantic-ui-react'
import Accordion from 'semantic-ui-react/dist/commonjs/modules/Accordion/Accordion'

import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'
import Open from '../Icon/Open'

import './BreakdownAccordion.css'

type Index = number | undefined

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

function handleClick(titleProps: AccordionTitleProps, idx: Index, setIdx: React.Dispatch<React.SetStateAction<Index>>) {
  const { index } = titleProps
  const numberIdx = toNumber(index)

  setIdx(numberIdx === idx ? undefined : numberIdx)
}

function BreakdownAccordion({ items }: Props) {
  const [idx, setIdx] = useState<Index>(undefined)
  const t = useFormatMessage()

  return (
    <>
      <Accordion fluid styled className="BreakdownAccordion">
        {items.map(({ title, subtitle, description, url, value }, i) => (
          <>
            <Accordion.Title
              className="BreakdownAccordion__TitleContainer"
              active={idx === i}
              index={i}
              onClick={(_, data) => handleClick(data, idx, setIdx)}
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
                      idx === i && 'BreakdownAccordion__Arrow--selected',
                    ])}
                  />
                </span>
              </div>
            </Accordion.Title>
            <Accordion.Content active={idx === i}>
              <p>{description}</p>
              {url && (
                <a href={url} target="_blank" rel="noopener noreferrer" className="BreakdownAccordion__Link">
                  {t('page.proposal_view.grant.relevant_link')} <Open />
                </a>
              )}
            </Accordion.Content>
          </>
        ))}
      </Accordion>
    </>
  )
}

export default BreakdownAccordion
