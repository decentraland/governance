import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'

import ContentLayout from './ContentLayout'
import Navigation, { NavigationTab } from './Navigation'

interface Props {
  title: string
  description: string
  activeTab?: NavigationTab
}

const MaintenanceLayout = ({ title, description, activeTab }: Props) => {
  return (
    <>
      <Head title={title} description={description} image="https://decentraland.org/images/decentraland.png" />
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
