import React, { useState } from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import toNumber from 'lodash/toNumber'
import type { AccordionTitleProps } from 'semantic-ui-react'
import Accordion from 'semantic-ui-react/dist/commonjs/modules/Accordion/Accordion'

import type { BudgetBreakdownItem } from '../../entities/Grant/types'
import ChevronRightCircleOutline from '../Icon/ChevronRightCircleOutline'

import './BreakdownAccordion.css'

type Index = number | undefined

interface Props {
  breakdown: BudgetBreakdownItem[]
}

function handleClick(titleProps: AccordionTitleProps, idx: Index, setIdx: React.Dispatch<React.SetStateAction<Index>>) {
  const { index } = titleProps
  const numberIdx = toNumber(index)

  setIdx(numberIdx === idx ? undefined : numberIdx)
}

function BreakdownAccordion({ breakdown }: Props) {
  const [idx, setIdx] = useState<Index>(undefined)
  const intl = useIntl()
  const t = useFormatMessage()

  return (
    <>
      <Markdown>{`## ${t('page.proposal_view.grant.breakdown_title')}`}</Markdown>
      <Accordion fluid styled className="BreakdownAccordion">
        {breakdown.map(({ concept, duration, estimatedBudget, aboutThis }, i) => (
          <>
            <Accordion.Title
              className="BreakdownAccordion__TitleContainer"
              active={idx === i}
              index={i}
              onClick={(_, data) => handleClick(data, idx, setIdx)}
            >
              <div>
                <div className="BreakdownAccordion__Title">{concept}</div>
                <div className="BreakdownAccordion__Subtitle">
                  {t('page.proposal_view.grant.breakdown_subtitle', { duration })}
                </div>
              </div>
              <div className="BreakdownAccordion__SizeContainer">
                <span>
                  {intl.formatNumber(toNumber(estimatedBudget), {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                  })}
                </span>
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
              <p>{aboutThis}</p>
            </Accordion.Content>
          </>
        ))}
      </Accordion>
    </>
  )
}

export default BreakdownAccordion
