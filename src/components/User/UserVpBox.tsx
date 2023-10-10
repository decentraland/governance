import VotingPower from '../Token/VotingPower'

import { UserStatBox } from './UserStatBox'
import './UserVpBox.css'

interface Props {
  title: string
  value?: number | bigint
  info?: string
  loading: boolean
  className?: string
}

export function UserVpBox({ title, info, value, loading, className }: Props) {
  return (
    <UserStatBox title={title} loading={loading} info={info} className={className}>
      <VotingPower value={value!} size="medium" className="UserVpBox__VotingPower" />
    </UserStatBox>
  )
}
