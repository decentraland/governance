
import React from 'react'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Back } from 'decentraland-ui/dist/components/Back/Back'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Title from 'decentraland-gatsby/dist/components/Text/Title'
import './SectionTitle.css'

export type SectionTitleProps =  React.HTMLProps<HTMLDivElement> & {
  title?: React.ReactNode
  onBack?: () => void
  loading?: boolean
}

export function SectionTitle({ title, loading, onBack, ...props }: SectionTitleProps) {

  return <div {...props} className={TokenList.join(['SectionTitle', props.className])}>
    <div className={TokenList.join(['SectionTitle__Container'])}>
      <Loader active={loading} />
      <Back onClick={onBack} />
      <Title>{title}</Title>
      {props.children && <div style={{ opacity: Number(!loading) }}>{props.children}</div>}
    </div>
  </div>
}