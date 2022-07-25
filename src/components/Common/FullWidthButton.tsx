import React from 'react'

import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import { Button } from 'decentraland-ui/dist/components/Button/Button'

import './FullWidthButton.css'

interface Props {
  onClick?: (param?: unknown) => void
  label: React.ReactText
  className?: string
  link?: string
  newWindow?: boolean
}

const FullWidthButton = ({ label, onClick, className, link, newWindow = false }: Props) => {
  return (
    <>
      <Button
        primary
        fluid
        className={TokenList.join(['FullWidthButton', className])}
        onClick={onClick}
        target={!!newWindow && '_blank'}
        rel={!!newWindow && 'noopener noreferrer'}
        href={link}
      >
        {label}
      </Button>
    </>
  )
}

export default FullWidthButton
