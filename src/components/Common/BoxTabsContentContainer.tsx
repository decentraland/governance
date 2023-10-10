import './BoxTabsContentContainer.css'

interface Props {
  children: React.ReactNode
}

const BoxTabsContentContainer = ({ children }: Props) => {
  return <div className="BoxTabsContentContainer">{children}</div>
}

export default BoxTabsContentContainer
