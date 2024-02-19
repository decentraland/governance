import useFormatMessage from '../../hooks/useFormatMessage'
import Heading from '../Common/Typography/Heading'
import Text from '../Common/Typography/Text'
import WiderContainer from '../Common/WiderContainer'

import ContentLayout from './ContentLayout'
import Head from './Head'
import Navigation, { NavigationTab } from './Navigation'

interface Props {
  title: string
  description: string
  activeTab?: NavigationTab
}

const MaintenancePage = () => {
  const t = useFormatMessage()

  return (
    <WiderContainer>
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Heading>{t('maintenance.title')}</Heading>
        <Text size="lg">{t('maintenance.description')}</Text>
      </div>
    </WiderContainer>
  )
}

const MaintenanceLayout = ({ title, description, activeTab }: Props) => {
  return (
    <>
      <Head title={title} description={description} />
      {activeTab && (
        <>
          <Navigation activeTab={activeTab} />
          <MaintenancePage />
        </>
      )}
      {!activeTab && (
        <ContentLayout>
          <MaintenancePage />
        </ContentLayout>
      )}
    </>
  )
}

export default MaintenanceLayout
