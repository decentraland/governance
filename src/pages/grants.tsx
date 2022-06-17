import React from 'react'

import Head from 'decentraland-gatsby/dist/components/Head/Head'
import MaintenancePage from 'decentraland-gatsby/dist/components/Layout/MaintenancePage'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { v1 as uuid } from 'uuid'

import Banner, { BannerType } from '../components/Grants/Banner'
import GrantCard from '../components/Grants/GrantCard'
import Navigation, { NavigationTab } from '../components/Layout/Navigation'
import { ProposalGrantCategory, ProposalGrantTier } from '../entities/Proposal/types'
import { ProjectHealth, UpdateAttributes, UpdateStatus } from '../entities/Updates/types'
import { isUnderMaintenance } from '../modules/maintenance'

import './grants.css'

type GenerateUpdate = Pick<
  UpdateAttributes,
  | 'health'
  | 'introduction'
  | 'highlights'
  | 'blockers'
  | 'next_steps'
  | 'additional_notes'
  | 'status'
  | 'created_at'
  | 'updated_at'
  | 'due_date'
  | 'completion_date'
>
const generateUpdate = (update: GenerateUpdate): UpdateAttributes => ({
  id: uuid(),
  proposal_id: uuid(),
  health: update.health,
  introduction: update.introduction,
  highlights: update.highlights,
  blockers: update.blockers,
  next_steps: update.next_steps,
  additional_notes: update.additional_notes,
  status: update.status,
  due_date: update.due_date,
  completion_date: update.completion_date,
  created_at: update.created_at,
  updated_at: update.updated_at,
})

export default function GrantsPage() {
  const t = useFormatMessage()

  if (isUnderMaintenance()) {
    return (
      <>
        <Head
          title={t('page.grants.title') || ''}
          description={t('page.grants.description') || ''}
          image="https://decentraland.org/images/decentraland.png"
        />
        <Navigation activeTab={NavigationTab.Grants} />
        <MaintenancePage />
      </>
    )
  }

  const getCurrentBannerItems = () => {
    return [
      { title: '5 projects open', description: 'Initiatives currently being funded' },
      { title: '$2.5 million USD released', description: 'Funding so far, for current batch' },
      { title: '$1.3 million USD to go', description: 'To be released for current batch' },
    ]
  }

  const getPastBannerItems = () => {
    return [
      { title: '25 projects', description: 'Initiatives successfully funded' },
      { title: '$4.5 million USD', description: 'Aggregated funding for past initiatives' },
      { title: '$1.3M per month', description: 'Avg. funding since Feb 2021' },
    ]
  }

  const getCurrentGrants = () => {
    const DONE_UPDATE = generateUpdate({
      health: ProjectHealth.OnTrack,
      introduction: 'Introduction',
      highlights: 'Highlights',
      blockers: 'Blockers',
      next_steps: 'Next steps',
      additional_notes: 'Additional notes',
      status: UpdateStatus.Done,
      created_at: Time.from().subtract(1, 'day').toDate(),
      updated_at: Time.from().subtract(1, 'day').toDate(),
      due_date: Time.from().add(1, 'month').toDate(),
      completion_date: Time.from().add(20, 'day').toDate(),
    })

    const MISSED_UPDATE = generateUpdate({
      health: undefined,
      introduction: undefined,
      highlights: undefined,
      blockers: undefined,
      next_steps: undefined,
      additional_notes: undefined,
      status: UpdateStatus.Pending,
      created_at: Time.from().subtract(2, 'day').toDate(),
      updated_at: Time.from().subtract(2, 'day').toDate(),
      due_date: Time.from().subtract(1, 'day').toDate(),
      completion_date: undefined,
    })

    return [
      {
        title: 'Expanding and improving WonderZone',
        category: ProposalGrantCategory.Community,
        tier: ProposalGrantTier.Tier6,
        size: 240000,
        update: DONE_UPDATE,
        vesting: {
          token: 'MANA',
          total: 230000,
          vested: 40000,
          released: 30000,
          vested_at: Time.from().subtract(1, 'month').toDate(),
        },
      },
      {
        title: 'Fund this initiative wo that everyone can be okay in the whole entire world',
        category: ProposalGrantCategory.Gaming,
        tier: ProposalGrantTier.Tier3,
        size: 40000,
        update: MISSED_UPDATE,
        vesting: {
          token: 'MANA',
          total: 20000,
          vested: 2000,
          released: 200,
          vested_at: Time.from().subtract(2, 'month').toDate(),
        },
      },
      {
        title: 'Implement an Escape Room SDK for further implementation',
        category: ProposalGrantCategory.ContentCreator,
        tier: ProposalGrantTier.Tier3,
        size: 40000,
        update: MISSED_UPDATE,
        vesting: {
          token: 'MANA',
          total: 20000,
          vested: 2000,
          released: 3000,
          vested_at: Time.from().subtract(2, 'month').toDate(),
        },
      },
      {
        title: 'Grant title',
        category: ProposalGrantCategory.PlatformContributor,
        tier: ProposalGrantTier.Tier3,
        size: 40000,
        update: MISSED_UPDATE,
        vesting: {
          token: 'DAI',
          total: 30000,
          vested: 3000,
          released: 200,
          vested_at: Time.from().subtract(2, 'month').toDate(),
        },
      },
    ]
  }
  return (
    <div>
      <Head
        title={t('page.grants.title') || ''}
        description={t('page.grants.description') || ''}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Navigation activeTab={NavigationTab.Grants} />
      <Container>
        <Banner
          type={BannerType.Current}
          title={t('page.grants.current_banner.title')}
          description={t('page.grants.current_banner.description')}
          items={getCurrentBannerItems()}
        />
        <br />
        <Container className="GrantsCards__Container">
          {getCurrentGrants().map((grant, index) => (
            <GrantCard
              key={`CurrentGrantCard_${index}`}
              title={grant.title}
              category={grant.category}
              size={grant.size}
              tier={grant.tier}
              update={grant.update}
              vesting={grant.vesting}
            />
          ))}
        </Container>
        <Banner
          type={BannerType.Past}
          title={t('page.grants.past_banner.title')}
          description={t('page.grants.past_banner.description')}
          items={getPastBannerItems()}
        />
      </Container>
    </div>
  )
}
