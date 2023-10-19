import Text from '../Common/Typography/Text'

import './FilterContainer.css'

type Props = {
  title: string
  children: React.ReactNode
}

export default function FilterContainer({ title, children }: Props) {
  return (
    <div className="FilterContainer">
      <div className="FilterContainer__TitleContainer">
        <Text className="FilterContainer__Title" size="sm" weight="semi-bold" color="secondary">
          {title}
        </Text>
      </div>
      <div className="FilterContainer__Content">{children}</div>
    </div>
  )
}
