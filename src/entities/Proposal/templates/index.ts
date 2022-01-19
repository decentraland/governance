import { Avatar } from 'decentraland-gatsby/dist/utils/api/Catalyst'
import { NewProposalBanName, NewProposalCatalyst, NewProposalGrant, NewProposalPOI, NewProposalPoll, ProposalType } from '../types'

import * as banName from './banName'
import * as catalyst from './catalyst'
import * as grant from './grant'
import * as poi from './poi'
import * as poll from './poll'
import { template } from './utils'

type NewConfiguration =
  | NewProposalBanName
  | NewProposalCatalyst
  | NewProposalGrant
  | NewProposalPOI
  | NewProposalPoll

export const title = async ({ type, configuration }: { type: ProposalType, configuration: NewConfiguration }) => {
  switch (type) {
    case ProposalType.POI:
      return poi.title(configuration as any)
    case ProposalType.BanName:
      return banName.title(configuration as any)
    case ProposalType.Catalyst:
      return catalyst.title(configuration as any)
    case ProposalType.Grant:
      return grant.title(configuration as any)
    case ProposalType.Poll:
      return poll.title(configuration as any)
  }
}

export const description = async ({ type, configuration }: { type: ProposalType, configuration: NewConfiguration }) => {
  switch (type) {
    case ProposalType.POI:
      return poi.description(configuration as any)
    case ProposalType.BanName:
      return banName.description(configuration as any)
    case ProposalType.Catalyst:
      return catalyst.description(configuration as any)
    case ProposalType.Grant:
      return grant.description(configuration as any)
    case ProposalType.Poll:
      return poll.description(configuration as any)
  }
}

export type SnapshotTemplateProps = {
  type: ProposalType,
  configuration: NewConfiguration,
  user: string,
  profile: Avatar | null,
  proposal_url: string
}

export const snapshotTitle = async ({ type, configuration }: SnapshotTemplateProps) => title({ type, configuration })

export const snapshotDescription = async ({ type, configuration, user, profile, proposal_url }: SnapshotTemplateProps) => template`

> by ${user + (profile?.name ? ` (${profile.name})` : '')}

${
  (type === ProposalType.POI ? await poi.pre_description(configuration as any) : '') +
  await description({type, configuration}) +
  (type === ProposalType.Poll ? await poll.post_description(configuration as any) : '')
}

**[Vote on this proposal on the Decentraland DAO](${proposal_url})**

`

export type ForumTemplateProps = {
  type: ProposalType,
  configuration: NewConfiguration,
  user: string,
  profile: Avatar | null,
  proposal_url: string,
  snapshot_url: string,
  snapshot_id: string
}

export const forumTitle = async ({ type, configuration, snapshot_id }: ForumTemplateProps) =>
  `[DAO: ${snapshot_id.slice(0, 7)}] ` + await title({ type, configuration })

export const forumDescription = async ({ type, configuration, user, profile, proposal_url, snapshot_url }: ForumTemplateProps) => template`

> by ${user + (profile?.name ? ` (${profile.name})` : '')}

${
  (type === ProposalType.POI ? await poi.pre_description(configuration as any) : '') +
  await description({type, configuration}) +
  (type === ProposalType.Poll ? await poll.post_description(configuration as any) : '')
}

**[Vote on this proposal on the Decentraland DAO](${proposal_url})**

**[View this proposal on Snapshot](${snapshot_url})**

`