import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import Divider from '../../Common/Divider'
import NewBadge from '../NewBadge/NewBadge'

import './ProposalProcess.css'

export enum ProcessStatus {
  Passed = 'passed',
  Active = 'active',
  Pending = 'pending',
  Rejected = 'rejected',
  Default = 'default',
}

interface Props {
  title: string
  items: {
    title: string
    description: string
    status: ProcessStatus
    statusText: string
  }[]
}

const VerticalLine = ({ position, isActive }: { position: 'top' | 'middle' | 'bottom'; isActive: boolean }) => {
  return (
    <div
      className={TokenList.join([
        'ProposalProcess__VerticalLine',
        `ProposalProcess__VerticalLine--${position}`,
        isActive && `ProposalProcess__VerticalLine--selected-${position}`,
      ])}
    />
  )
}

export default function ProposalProcess({ title, items }: Props) {
  return (
    <div>
      <Divider />
      <div className="ProposalProcess__TitleContainer">
        <h3 className="ProposalProcess__Title">{title}</h3>
        <span>
          <NewBadge />
        </span>
      </div>
      {items.map(({ title, description, statusText, status }, index) => {
        const isActive = status === ProcessStatus.Active
        const isFirstItem = index === 0
        const isLastItem = index + 1 === items.length
        const isMiddleItem = !isFirstItem && !isLastItem

        return (
          <div key={title} className="ProposalProcess__ItemContainer">
            {isActive && <div className="ProposalProcess__ItemGradient" />}
            <div className={TokenList.join(['ProposalProcess__Item', isActive && 'ProposalProcess__Item--selected'])}>
              <div className="ProposalProcess__ItemNumberContainer">
                {isFirstItem && <VerticalLine position="top" isActive={isActive} />}
                {isMiddleItem && <VerticalLine position="middle" isActive={isActive} />}
                {isLastItem && <VerticalLine position="bottom" isActive={isActive} />}
                <div
                  className={TokenList.join(['ProposalProcess__ItemNumber', `ProposalProcess__ItemNumber--${status}`])}
                >
                  {index + 1}
                </div>
              </div>
              <div>
                <h3
                  className={TokenList.join([
                    'ProposalProcess__ItemTitle',
                    isActive && 'ProposalProcess__ItemTitle--selected',
                  ])}
                >
                  {title}
                </h3>
                <p
                  className={TokenList.join([
                    'ProposalProcess__ItemDescription',
                    isActive && 'ProposalProcess__ItemDescription--selected',
                  ])}
                >
                  {description}
                </p>
                {statusText !== '' && (
                  <span
                    className={TokenList.join([
                      'ProposalProcess___StatusText',
                      `ProposalProcess___StatusText--${status}`,
                    ])}
                  >
                    {statusText}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
