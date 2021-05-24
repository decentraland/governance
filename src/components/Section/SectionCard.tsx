
import React from 'react'
import { Card } from "decentraland-ui/dist/components/Card/Card"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import SubTitle from 'decentraland-gatsby/dist/components/Text/SubTitle'

import './SectionCard.css'

export type SectionCardProps =  React.HTMLProps<HTMLDivElement> & {
  leftHead?: React.ReactNode
  rightHead?: React.ReactNode
  loading?: boolean
  stacked?: boolean
  empty?: boolean
  emptyContent?: React.ReactNode
}

export default function SectionCard({ leftHead, rightHead, stacked, loading, empty, emptyContent, ...props }: SectionCardProps) {
  return <div {...props} className={TokenList.join(['SectionCard', props.className])}>
    {(leftHead || rightHead) && <div className="SectionCard__Title">
      <div className="SectionCard__Title__Left">
        {typeof leftHead === 'string' ? <SubTitle>{leftHead}</SubTitle> : leftHead}
      </div>
      <div className="SectionCard__Title__Right">
        {typeof rightHead === 'string' ? <SubTitle>{rightHead}</SubTitle> : rightHead}
      </div>
    </div>}
    <div className={TokenList.join(['SectionCard__Container', stacked && 'SectionCard__Container--stacked'])}>
      <Card className="SectionCard__Container__Card">
        {loading && <Loader active />}
        {!loading && empty && <div className="EmptyCard">
          {typeof emptyContent === 'string' ? <Header sub>{emptyContent}</Header> : emptyContent}
        </div>}
        {!loading && !empty && props.children}
      </Card>
    </div>
  </div>
}