import classNames from 'classnames'

import Markdown from '../../Common/Typography/Markdown'

import './ProposalProcess.css'
import Section from './Section'

export enum ProcessStatus {
  Passed = 'passed',
  Active = 'active',
  Pending = 'pending',
  Rejected = 'rejected',
  Default = 'default',
}

export enum ProcessType {
  Governance = 'governance',
  BiddingAndTendering = 'bidding-and-tendering',
}

interface Props {
  title: string
  isNew?: boolean
  type: ProcessType
  items: {
    title: string
    description: string
    status: ProcessStatus
    statusText?: string
  }[]
}

const VerticalLine = ({ position, isActive }: { position: 'top' | 'middle' | 'bottom'; isActive: boolean }) => {
  return (
    <div
      className={classNames(
        'ProposalProcess__VerticalLine',
        `ProposalProcess__VerticalLine--${position}`,
        isActive && `ProposalProcess__VerticalLine--selected-${position}`
      )}
    />
  )
}

export default function ProposalProcess({ title, items, isNew = false, type = ProcessType.Governance }: Props) {
  return (
    <Section title={title} isNew={isNew}>
      {items.map(({ title, description, statusText, status }, index) => {
        const isActive = status === ProcessStatus.Active
        const isFirstItem = index === 0
        const isLastItem = index + 1 === items.length
        const isMiddleItem = !isFirstItem && !isLastItem

        return (
          <div key={title} className="ProposalProcess__ItemContainer">
            {isActive && (
              <div className={classNames('ProposalProcess__ItemGradient', `ProposalProcess__ItemGradient--${type}`)} />
            )}
            <div className={classNames('ProposalProcess__Item', isActive && 'ProposalProcess__Item--selected')}>
              <div className="ProposalProcess__ItemNumberContainer">
                {isFirstItem && <VerticalLine position="top" isActive={isActive} />}
                {isMiddleItem && <VerticalLine position="middle" isActive={isActive} />}
                {isLastItem && <VerticalLine position="bottom" isActive={isActive} />}
                <div className={classNames('ProposalProcess__ItemNumber', `ProposalProcess__ItemNumber--${status}`)}>
                  {index + 1}
                </div>
              </div>
              <div>
                <h3
                  className={classNames(
                    'ProposalProcess__ItemTitle',
                    isActive && 'ProposalProcess__ItemTitle--selected'
                  )}
                >
                  {title}
                </h3>
                <p
                  className={classNames(
                    'ProposalProcess__ItemDescription',
                    isActive && 'ProposalProcess__ItemDescription--selected'
                  )}
                >
                  {description}
                </p>
                {statusText && statusText !== '' && (
                  <span className="ProposalProcess___StatusTextContainer">
                    <Markdown
                      size="xs"
                      componentsClassNames={{
                        p: classNames('ProposalProcess___StatusText', `ProposalProcess___StatusText--${status}`),
                        strong: classNames(
                          'ProposalProcess___StatusTextStrong',
                          `ProposalProcess___StatusTextStrong--${status}`
                        ),
                      }}
                    >
                      {statusText}
                    </Markdown>
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </Section>
  )
}
