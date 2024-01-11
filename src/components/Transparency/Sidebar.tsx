import Heading from '../Common/Typography/Heading'
import SidebarLinkButton, { SidebarLinkButtonProps } from '../Proposal/View/SidebarLinkButton'

import './Sidebar.css'

interface Props {
  title: string
  description: string
  buttons?: SidebarLinkButtonProps[]
}

function Sidebar({ title, description, buttons }: Props) {
  return (
    <div className="Transparency__Sidebar">
      <Heading size="sm" weight="semi-bold">
        {title}
      </Heading>
      <p>{description}</p>
      {buttons?.map((buttonProps, index) => (
        <SidebarLinkButton key={[`button-${title}`, index].join('::')} {...buttonProps} />
      ))}
    </div>
  )
}

export default Sidebar
