import React from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import MemberCard from './MemberCard'
import './MembersSection.css'
import { Member } from '../../api/DclData'

const infoIcon = require('../../images/icons/info.svg').default

export type MembersSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string
  description: string
  members: Member[]
}

export default function MembersSection({ title, description, members }: MembersSectionProps) {
  return (
    <Card.Content>
      <Header className={'MembersHeader'}>
        {title}
        <Popup
          className="MembersPopup"
          content={
            <Paragraph small secondary className={'MembersPopup__Content'}>
              {description}
            </Paragraph>
          }
          position="bottom center"
          trigger={<img className={'MembersPopup__Icon'} src={infoIcon} width="14" height="14" alt="info" />}
          eventsEnabled={false}
          on="click"
          pinned={false}
        />
      </Header>
      <div className="MembersContainer">
        {members.map((member, index) => {
          return (
            <MemberCard
              key={[title.trim(), member.name.trim(), index].join('::')}
              member={{ avatar: member.avatar, name: member.name }}
            />
          )
        })}
      </div>
    </Card.Content>
  )
}
