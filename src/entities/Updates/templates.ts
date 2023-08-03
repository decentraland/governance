import { template } from '../Proposal/templates/utils'

export type ForumTemplate = {
  user: string
  update_id: string
  update_url: string
  title: string
}

export const forumTitle = ({ update_id, title }: ForumTemplate) =>
  `[DAO:${update_id.slice(update_id.length - 7, update_id.length)}] Update for  ${title}`

export const forumDescription = ({ user, update_url }: ForumTemplate) => template`

> by ${user}

**[View this update on the Governance dApp](${update_url})**
`
