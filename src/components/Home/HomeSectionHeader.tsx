import Markdown from '../Common/Typography/Markdown'

import './HomeSectionHeader.css'

interface Props {
  title: string
  description: string
}

const HomeSectionHeader = ({ title, description }: Props) => {
  return (
    <>
      <h2 className="HomeSectionHeader__Title">{title}</h2>
      <Markdown componentsClassNames={{ p: 'HomeSectionHeader__Description' }}>{description}</Markdown>
    </>
  )
}

export default HomeSectionHeader
