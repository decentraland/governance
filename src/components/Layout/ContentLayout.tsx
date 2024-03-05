import classNames from 'classnames'
import { Back } from 'decentraland-ui/dist/components/Back/Back'
import { Container } from 'decentraland-ui/dist/components/Container/Container'

import usePreventNavigation from '../../hooks/usePreventNavigation'
import locations, { navigate } from '../../utils/locations'

import './ContentLayout.css'

type Props = {
  className?: string
  small?: boolean
  children?: React.ReactNode
  navigateHref?: string
  preventNavigation?: boolean
}

export default function ContentLayout({ navigateHref, className, small, preventNavigation, children }: Props) {
  const handleBack = () => {
    if (preventNavigation) {
      window.history.back()
    } else {
      navigate(navigateHref || locations.proposals())
    }
  }

  usePreventNavigation(!!preventNavigation)

  return (
    <Container className={classNames('ContentLayout', className)}>
      <div className="ContentLayout__Back">
        <Back onClick={handleBack} />
      </div>
      <div className={classNames('ContentLayout__Container', small && 'ContentLayout__Container--small')}>
        {children}
      </div>
    </Container>
  )
}

// TODO: Remove, use the other component from /components/Layout/ContentSection
export function ContentSection(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames('ContentLayout__Section', props.className)} />
}
