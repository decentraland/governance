import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import React from 'react'
import { DelegationsLabel } from '../../entities/Votes/utils'
import Username from '../User/Username'
import './DelegateLabel.css'

interface Props {
  delegate: string
  delegationsLabel: DelegationsLabel
}

const DelegateLabel = ({ delegationsLabel, delegate }: Props) => {
  const t = useFormatMessage()
  const {id, values, showDelegate} = delegationsLabel
  const label = t(id, values)
  return (
    <span className={"DelegateLabel"}>
      {showDelegate && <Username address={delegate} />}
      <Markdown className="DelegateLabel__Text">{label}</Markdown>
    </span>
  )
}

export default DelegateLabel
