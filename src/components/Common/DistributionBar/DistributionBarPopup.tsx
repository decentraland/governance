import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import useFormatMessage from '../../../hooks/useFormatMessage'

import './DistributionBarPopup.css'

type PopupPropsPosition =
  | 'top center'
  | 'top left'
  | 'top right'
  | 'bottom right'
  | 'bottom left'
  | 'right center'
  | 'left center'
  | 'bottom center'
  | undefined

export interface DistributionBarPopupContent {
  title: string
  content: React.ReactNode
  sub?: React.ReactNode
  position?: PopupPropsPosition
}

interface DistributionBarPopupProps {
  popupContent: DistributionBarPopupContent
  open?: boolean
  children: React.ReactNode
}

const DistributionBarPopup = ({ popupContent, open, children }: DistributionBarPopupProps) => {
  const t = useFormatMessage()

  return (
    <Popup
      className="DistributionBarPopup"
      position={popupContent.position || 'top center'}
      trigger={children}
      open={open}
      hideOnScroll={true}
      hoverable={false}
    >
      <Popup.Content>
        <div className="DistributionBarPopup">
          <div className="DistributionBarPopup__Title">{t(popupContent.title)}</div>
          <div className="DistributionBarPopup__Content">{popupContent.content}</div>
          {popupContent.sub && <div className="DistributionBarPopup__Sub">{popupContent.sub}</div>}
        </div>
      </Popup.Content>
    </Popup>
  )
}

export default DistributionBarPopup
