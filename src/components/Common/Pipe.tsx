import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './Pipe.css'

interface Props {
  className?: string
}

export default function Pipe({ className }: Props) {
  return <div className={TokenList.join(['Pipe', className])} />
}
