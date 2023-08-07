import { template } from '../Proposal/templates/utils'

import { ProjectHealth, UpdateAttributes, UpdateStatus } from './types'

const HealthEmoji = {
  [ProjectHealth.OnTrack]: '🟢',
  [ProjectHealth.AtRisk]: '🟡',
  [ProjectHealth.OffTrack]: '🔴',
}

const HealthText = {
  [ProjectHealth.OnTrack]: 'On Track',
  [ProjectHealth.AtRisk]: 'At Risk',
  [ProjectHealth.OffTrack]: 'Off Track',
}

const StatusText = {
  [UpdateStatus.Done]: 'On Time',
  [UpdateStatus.Late]: 'Late',
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
${status === UpdateStatus.Done || status === UpdateStatus.Late ? `Update Status: ${StatusText[status]}` : ''}
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
