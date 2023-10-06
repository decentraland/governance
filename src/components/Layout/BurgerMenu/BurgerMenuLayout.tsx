import { Mobile, NotMobile } from 'decentraland-ui/dist/components/Media/Media'

import { useBurgerMenu } from '../../../hooks/useBurgerMenu'
import { NavigationProps } from '../Navigation'

import BurgerMenuContent from './BurgerMenuContent'

interface Props {
  children: React.ReactNode
  navigationOnly?: boolean
  activeTab: NavigationProps['activeTab']
}

function BurgerMenuLayout({ children, navigationOnly, activeTab }: Props) {
  const { status } = useBurgerMenu()
  const { open, translate, snapshotStatusBarOpen } = status
  return (
    <>
      <Mobile>
        <BurgerMenuContent
          navigationOnly={navigationOnly}
          activeTab={activeTab}
          snapshotStatusBarOpen={snapshotStatusBarOpen}
        />
        <div className="Animated" style={open ? { transform: `translateY(${translate})` } : undefined}>
          {children}
        </div>
      </Mobile>
      <NotMobile>{children}</NotMobile>
    </>
  )
}

export default BurgerMenuLayout
