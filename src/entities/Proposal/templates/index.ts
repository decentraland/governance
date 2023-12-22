import { DclProfile } from '../../../utils/Catalyst/types'
import {
  GrantProposalConfiguration,
  NewProposalBanName,
  NewProposalCatalyst,
  NewProposalDraft,
  NewProposalGovernance,
  NewProposalLinkedWearables,
  NewProposalPOI,
  NewProposalPitch,
  NewProposalPoll,
  NewProposalTender,
  ProposalType,
} from '../types'

import * as linkedWearables from './LinkedWearables'
import * as banName from './banName'
import * as bid from './bid'
import * as catalyst from './catalyst'
import * as draft from './draft'
import * as governance from './governance'
import * as grant from './grant'
import * as hiring from './hiring'
import * as pitch from './pitch'
import * as poi from './poi'
import * as poll from './poll'
import * as tender from './tender'
import { template } from './utils'

/* eslint-disable @typescript-eslint/no-explicit-any */

type NewConfiguration =
  | NewProposalLinkedWearables
  | NewProposalBanName
  | NewProposalCatalyst
  | GrantProposalConfiguration
  | NewProposalPOI
  | NewProposalPoll
  | NewProposalDraft
  | NewProposalGovernance
  | NewProposalPitch
  | NewProposalTender

export const title = ({ type, configuration }: { type: ProposalType; configuration: NewConfiguration }) => {
  switch (type) {
    case ProposalType.POI:
      return poi.title(configuration as any)
    case ProposalType.BanName:
      return banName.title(configuration as any)
    case ProposalType.Catalyst:
      return catalyst.title(configuration as any)
    case ProposalType.Grant:
      return grant.title(configuration as GrantProposalConfiguration)
    case ProposalType.Poll:
      return poll.title(configuration as any)
    case ProposalType.Draft:
      return draft.title(configuration as any)
    case ProposalType.Governance:
      return governance.title(configuration as any)
    case ProposalType.LinkedWearables:
      return linkedWearables.title(configuration as any)
    case ProposalType.Pitch:
      return pitch.title(configuration as any)
    case ProposalType.Tender:
      return tender.title(configuration as any)
    case ProposalType.Bid:
      return bid.title(configuration as any)
    case ProposalType.Hiring:
      return hiring.title(configuration as any)
  }
}

export const description = async ({ type, configuration }: { type: ProposalType; configuration: NewConfiguration }) => {
  switch (type) {
    case ProposalType.POI:
      return poi.description(configuration as any)
    case ProposalType.BanName:
      return banName.description(configuration as any)
    case ProposalType.Catalyst:
      return catalyst.description(configuration as any)
    case ProposalType.Grant:
      return grant.description(configuration as GrantProposalConfiguration)
    case ProposalType.Poll:
      return poll.description(configuration as any)
    case ProposalType.Draft:
      return await draft.description(configuration as any)
    case ProposalType.Governance:
      return await governance.description(configuration as any)
    case ProposalType.LinkedWearables:
      return linkedWearables.description(configuration as any)
    case ProposalType.Pitch:
      return pitch.description(configuration as any)
    case ProposalType.Tender:
      return await tender.description(configuration as any)
    case ProposalType.Bid:
      return await bid.description(configuration as any)
    case ProposalType.Hiring:
      return hiring.description(configuration as any)
  }
}

export type SnapshotTemplateProps = {
  type: ProposalType
  configuration: NewConfiguration
  user: string
  profile: DclProfile | null
  proposal_url: string
}

export const snapshotTitle = ({ type, configuration }: SnapshotTemplateProps) => title({ type, configuration })

export const snapshotDescription = async ({
  type,
  configuration,
  user,
  profile,
  proposal_url,
}: SnapshotTemplateProps) => template`

> by ${user + (profile?.username ? ` (${profile.username})` : '')}

${
  (type === ProposalType.POI ? await poi.pre_description(configuration as any) : '') +
  (await description({ type, configuration })) +
  (type === ProposalType.Poll ? await poll.post_description(configuration as any) : '')
}

**[This proposal is summarized due to technical limitations. To view it complete and vote on it, visit the DCL DAO Governance dApp](${proposal_url})**

`

export type ForumTemplate = {
  type: ProposalType
  configuration: NewConfiguration
  user: string
  profile: DclProfile | null
  proposal_url: string
  snapshot_url: string
  snapshot_id: string
}

export const forumTitle = ({ type, configuration, snapshot_id }: ForumTemplate) =>
  `[DAO:${snapshot_id.slice(snapshot_id.length - 7, snapshot_id.length)}] ` + title({ type, configuration })

export const forumDescription = async ({
  type,
  configuration,
  user,
  profile,
  proposal_url,
  snapshot_url,
}: ForumTemplate) => template`

> by ${user + (profile?.username ? ` (${profile.username})` : '')}

${
  (type === ProposalType.POI ? await poi.pre_description(configuration as any) : '') +
  (await description({ type, configuration })) +
  (type === ProposalType.Poll ? await poll.post_description(configuration as any) : '')
}

**[Vote on this proposal on the Decentraland DAO](${proposal_url})**

**[View this proposal on Snapshot](${snapshot_url})**

`
