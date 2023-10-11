import UserInformation, { UserInformationProps } from 'decentraland-gatsby/dist/components/User/UserInformation'

function Navbar(props: UserInformationProps) {
  return <UserInformation {...props} />
}

export default Navbar
