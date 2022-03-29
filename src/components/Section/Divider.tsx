import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import React from 'react'
import './Divider.css'

export default function Divider({ className, size }: { className?: string; size?: 'small' }) {
  return (
    <div className={TokenList.join([size && `Divider__Container--${size}`, className])}>
      <hr className="Divider" />
    </div>
  )
}
