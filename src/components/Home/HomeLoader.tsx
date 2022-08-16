import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import './HomeLoader.css'

interface Props {
  className?: string
  children: React.ReactText
  size?: 'large' | 'small'
}

const HomeLoader = ({ children, className, size = 'large' }: Props) => {
  return (
    <div className={TokenList.join(['HomeLoader__Container', className])}>
      <Loader className="HomeLoader__Loader" active size={size} />
      <span className={TokenList.join(['HomeLoader__Text', `HomeLoader__Text--${size}`])}>{children}</span>
    </div>
  )
}

export default HomeLoader
