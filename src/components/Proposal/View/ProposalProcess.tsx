import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import Divider from '../../Common/Divider'
import NewBadge from '../NewBadge/NewBadge'

import './ProposalProcess.css'

interface Props {
  title: string
  items: {
    title: string
    description: string
    isSelected: boolean
  }[]
}

const VerticalLine = ({ position, isSelected }: { position: 'top' | 'middle' | 'bottom'; isSelected: boolean }) => {
  return (
    <div
      className={TokenList.join([
        'ProposalProcess__VerticalLine',
        `ProposalProcess__VerticalLine--${position}`,
        isSelected && `ProposalProcess__VerticalLine--selected-${position}`,
      ])}
    />
  )
}

export default function ProposalProcess({ title, items }: Props) {
  return (
    <div>
      <Divider />
      <div className="ProposalProcess__TitleContainer">
        <h3 className="ProposalProcess_Title">{title}</h3>
        <span>
          <NewBadge />
        </span>
      </div>
      {items.map(({ title, description, isSelected }, index) => {
        const isFirstItem = index === 0
        const isLastItem = index + 1 === items.length
        const isMiddleItem = !isFirstItem && !isLastItem

        return (
          <div key={title} className="ProposalProcess__ItemContainer">
            {isSelected && <div className="ProposalProcess__ItemGradient" />}
            <div className={TokenList.join(['ProposalProcess__Item', isSelected && 'ProposalProcess__Item--selected'])}>
              <div className="ProposalProcess__ItemNumberContainer">
                {isFirstItem && <VerticalLine position="top" isSelected={isSelected} />}
                {isMiddleItem && <VerticalLine position="middle" isSelected={isSelected} />}
                {isLastItem && <VerticalLine position="bottom" isSelected={isSelected} />}
                <div
                  className={TokenList.join([
                    'ProposalProcess__ItemNumber',
                    isSelected && 'ProposalProcess__ItemNumber--selected',
                  ])}
                >
                  {index + 1}
                </div>
              </div>
              <div>
                <h3
                  className={TokenList.join([
                    'ProposalProcess__ItemTitle',
                    isSelected && 'ProposalProcess__ItemTitle--selected',
                  ])}
                >
                  {title}
                </h3>
                <p
                  className={TokenList.join([
                    'ProposalProcess__ItemDescription',
                    isSelected && 'ProposalProcess__ItemDescription--selected',
                  ])}
                >
                  {description}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
