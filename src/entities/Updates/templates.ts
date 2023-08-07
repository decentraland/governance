import { template } from '../Proposal/templates/utils'

import { ProjectHealth, UpdateAttributes, UpdateStatus } from './types'

const HealthEmoji = {
  [ProjectHealth.OnTrack]: '🟢',
  [ProjectHealth.AtRisk]: '🟡',
  [ProjectHealth.OffTrack]: '🔴',
}

const HealthText = {
  [ProjectHealth.OnTrack]: 'On track',
  [ProjectHealth.AtRisk]: 'At risk',
  [ProjectHealth.OffTrack]: 'Off track',
}

export type ForumTemplate = {
  author: string
  update_url: string
  title: string
} & UpdateAttributes

export const forumTitle = ({ id, title }: ForumTemplate) => `[DAO:${id.slice(id.length - 7, id.length)}] ${title}`

export const forumDescription = ({
  author,
  update_url,
  health,
  status,
  introduction,
  highlights,
  blockers,
  next_steps,
  additional_notes,
}: ForumTemplate) => template`

Author: ${author}
${status === UpdateStatus.Late ? 'This project is late.' : ''}
${health ? `Project Health: ${HealthEmoji[health]} ${HealthText[health]}` : ''}

## Introduction 

${introduction}

## Highlights

${highlights}

## Blockers

${blockers}

## Next steps

${next_steps}

## Additional notes and links
${additional_notes}

**[View this update on the Governance dApp](${update_url})**
`
