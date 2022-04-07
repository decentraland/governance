import React from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'
import Link from 'decentraland-gatsby/dist/components/Text/Link'
import Watermelon from '../Icon/Watermelon'
import './Empty.css'

interface Props {
  title?: string | null
  description?: string | null
  linkText?: string | null
  linkHref?: string
  className?: string
  onLinkClick?: () => void
  icon?: React.ReactNode
}

export default function Empty({ icon, title, description, className, linkText, linkHref, onLinkClick }: Props) {
  return (
    <div className={TokenList.join(['Empty', className])}>
      {!!icon ? icon : <Watermelon />}
      {!!title && <Header>{title}</Header>}
      {!!description && <Markdown className="Empty__Description" source={description} />}
      {!!linkText && (onLinkClick || linkHref) && (
        <Link href={linkHref} onClick={onLinkClick}>
          {linkText}
        </Link>
      )}
    </div>
  )
}
