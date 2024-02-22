import useFormatMessage from '../../hooks/useFormatMessage'
import Heading from '../Common/Typography/Heading'
import Text from '../Common/Typography/Text'
import WiderContainer from '../Common/WiderContainer'

import './MaintenancePage.css'

export default function MaintenancePage() {
  const t = useFormatMessage()

  return (
    <WiderContainer>
      <div className="MaintenancePage">
        <Heading>{t('maintenance.title')}</Heading>
        <Text size="lg">{t('maintenance.description')}</Text>
      </div>
    </WiderContainer>
  )
}
