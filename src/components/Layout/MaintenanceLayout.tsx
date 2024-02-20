import ContentLayout from './ContentLayout'
import Head from './Head'
import MaintenancePage from './MaintenancePage'
import Navigation, { NavigationTab } from './Navigation'

interface Props {
  title: string
  description: string
  activeTab?: NavigationTab
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
