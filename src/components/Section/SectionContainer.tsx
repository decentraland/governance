
import React from 'react'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import './SectionContainer.css'

export type SectionContainerProps =  React.HTMLProps<HTMLDivElement>

export default function SectionContainer(props: SectionContainerProps) {
  return <div {...props} className={TokenList.join(['SectionContainer', props.className])}>
    <div className="SectionContainer__Container">
      {props.children}
    </div>
  </div>
}