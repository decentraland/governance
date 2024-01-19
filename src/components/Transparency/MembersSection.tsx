import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import { Member } from '../../clients/Transparency'
import Text from '../Common/Typography/Text'
import Info from '../Icon/Info'

import MemberCard from './MemberCard'
import './MembersSection.css'

interface Props {
  title: string
  description: string
  members: Member[]
}

export default function MembersSection({ title, description, members }: Props) {
  return (
    <Card.Content>
      <Header className="MembersHeader">
        {title}
        <Popup
          className="MembersPopup"
          content={<Text className="MembersPopup__Content">{description}</Text>}
          position="bottom center"
          trigger={
            <div className="MembersPopup__Icon">
              <Info size="14" />
            </div>
          }
          eventsEnabled={false}
          on="click"
          pinned={false}
        />
      </Header>
      <div className="MembersContainer">
        {members.map((member) => {
          return <MemberCard key={member.address} member={member} />
        })}
      </div>
    </Card.Content>
  )
}
