import Markdown from './Typography/Markdown'
import Text from './Typography/Text'

import './SubLabel.css'

interface Props {
  children: string
  isMarkdown?: boolean
}

const SubLabel = ({ children, isMarkdown }: Props) => {
  if (isMarkdown) {
    return (
      <Markdown className="SubLabel" componentsClassNames={{ p: 'SubLabel', strong: 'SubLabel__Strong' }}>
        {children}
      </Markdown>
    )
  }

  return (
    <Text weight="semi-bold" color="secondary" className="SubLabel">
      {children}
    </Text>
  )
}

export default SubLabel
