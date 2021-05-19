import React, { useEffect } from 'react'
import Helmet from 'react-helmet'
import { navigate } from "gatsby-plugin-intl"
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Field } from "decentraland-ui/dist/components/Field/Field"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import { SignIn } from "decentraland-ui/dist/components/SignIn/SignIn"
import { SelectField } from "decentraland-ui/dist/components/SelectField/SelectField"
import { isProposalGrantCategory, isProposalGrantTier, newProposalGrantScheme, ProposalGrantCategory, ProposalGrantTier } from '../../entities/Proposal/types'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import MarkdownTextarea from 'decentraland-gatsby/dist/components/Form/MarkdownTextarea'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import useEditor, { assert, createValidator } from 'decentraland-gatsby/dist/hooks/useEditor'
import ContentLayout, { ContentSection } from '../../components/Layout/ContentLayout'
import { Governance } from '../../api/Governance'
import loader from '../../modules/loader'
import locations from '../../modules/locations'
import Label from 'decentraland-gatsby/dist/components/Form/Label'
import './submit.css'
import { asNumber } from '../../entities/Proposal/utils'
import useAuthContext from 'decentraland-gatsby/dist/context/Auth/useAuthContext'

type GrantState = {
  title: string,
  abstract: string,
  category: string | null,
  tier: string | null,
  size: string | number,
  description: string,
  specification: string,
  personnel: string,
  roadmap: string
}

const initialPollState: GrantState = {
  title: '',
  abstract: '',
  category: null,
  tier: null,
  size: '',
  description: '',
  specification: '',
  personnel: '',
  roadmap: ''
}

const categories = [
  { key: ProposalGrantCategory.Community, text: ProposalGrantCategory.Community, value: ProposalGrantCategory.Community },
  { key: ProposalGrantCategory.ContentCreator, text: ProposalGrantCategory.ContentCreator, value: ProposalGrantCategory.ContentCreator },
  { key: ProposalGrantCategory.Exceptional, text: ProposalGrantCategory.Exceptional, value: ProposalGrantCategory.Exceptional },
  { key: ProposalGrantCategory.Gaming, text: ProposalGrantCategory.Gaming, value: ProposalGrantCategory.Gaming },
  { key: ProposalGrantCategory.PlatformContributor, text: ProposalGrantCategory.PlatformContributor, value: ProposalGrantCategory.PlatformContributor },
]

const tiers = [
  { key: ProposalGrantTier.Tier1, text: ProposalGrantTier.Tier1, value: ProposalGrantTier.Tier1 },
  { key: ProposalGrantTier.Tier2, text: ProposalGrantTier.Tier2, value: ProposalGrantTier.Tier2 },
  { key: ProposalGrantTier.Tier3, text: ProposalGrantTier.Tier3, value: ProposalGrantTier.Tier3 },
]

const schema = newProposalGrantScheme.properties
const edit = (state: GrantState, props: Partial<GrantState>) => {
  return {
    ...state,
    ...props,
  }
}

const validate = createValidator<GrantState>({
  category: (state) => ({
    category: assert(!state.category || isProposalGrantCategory(state.category), 'error.grant.category_invalid') ||
    undefined
  }),
  tier: (state) => ({
    tier: assert(!state.tier || isProposalGrantTier(state.tier), 'error.grant.tier_invalid') ||
    undefined
  }),
  size: (state) => ({
    size: assert(!state.size || Number.isFinite(asNumber(state.size)), 'error.grant.size_invalid')
  }),
  title: (state) => ({
    title: assert(state.title.length <= schema.title.maxLength, 'error.grant.title_too_large') ||
    undefined
  }),
  abstract: (state) => ({
    abstract: assert(state.abstract.length <= schema.abstract.maxLength, 'error.grant.abstract_too_large') ||
    undefined
  }),
  description: (state) => ({
    description: assert(state.description.length <= schema.description.maxLength, 'error.grant.description_too_large') ||
    undefined
  }),
  specification: (state) => ({
    specification: assert(state.specification.length <= schema.specification.maxLength, 'error.grant.specification_too_large') ||
    undefined
  }),
  personnel: (state) => ({
    personnel: assert(state.personnel.length <= schema.personnel.maxLength, 'error.grant.personnel_too_large') ||
    undefined
  }),
  roadmap: (state) => ({
    roadmap: assert(state.roadmap.length <= schema.roadmap.maxLength, 'error.grant.roadmap_too_large')
  }),
  '*': (state) => ({
    category: (
      assert(!!state.category, 'error.grant.category_empty') ||
      assert(isProposalGrantCategory(state.category), 'error.grant.category_invalid')
    ),
    tier: (
      assert(!!state.tier, 'error.grant.tier_empty') ||
      assert(isProposalGrantTier(state.tier), 'error.grant.tier_invalid')
    ),
    title: (
      assert(state.title.length > 0, 'error.grant.title_empty') ||
      assert(state.title.length >= schema.title.minLength, 'error.grant.title_too_short') ||
      assert(state.title.length <= schema.title.maxLength, 'error.grant.title_too_large')
    ),
    size: (
      assert(state.size !== '', 'error.grant.size_empty') ||
      assert(Number.isFinite(asNumber(state.size)), 'error.grant.size_invalid') ||
      assert(asNumber(state.size) >= schema.size.min, 'error.grant.size_too_low')
    ),
    abstract: (
      assert(state.abstract.length > 0, 'error.grant.abstract_empty') ||
      assert(state.abstract.length >= schema.abstract.minLength, 'error.grant.abstract_too_short') ||
      assert(state.abstract.length <= schema.abstract.maxLength, 'error.grant.abstract_too_large')
    ),
    description: (
      assert(state.description.length > 0, 'error.grant.description_empty') ||
      assert(state.description.length >= schema.description.minLength, 'error.grant.description_too_short') ||
      assert(state.description.length <= schema.description.maxLength, 'error.grant.description_too_large')
    ),
    specification: (
      assert(state.specification.length > 0, 'error.grant.specification_empty') ||
      assert(state.specification.length >= schema.specification.minLength, 'error.grant.specification_too_short') ||
      assert(state.specification.length <= schema.specification.maxLength, 'error.grant.specification_too_large')
    ),
    personnel: (
      assert(state.personnel.length > 0, 'error.grant.personnel_empty') ||
      assert(state.personnel.length >= schema.personnel.minLength, 'error.grant.personnel_too_short') ||
      assert(state.personnel.length <= schema.personnel.maxLength, 'error.grant.personnel_too_large')
    ),
    roadmap: (
      assert(state.roadmap.length > 0, 'error.grant.roadmap_empty') ||
      assert(state.roadmap.length >= schema.roadmap.minLength, 'error.grant.roadmap_too_short') ||
      assert(state.roadmap.length <= schema.roadmap.maxLength, 'error.grant.roadmap_too_large')
    )
  })
})

export default function SubmitBanName() {
  const l = useFormatMessage()
  const [ account, accountState ] = useAuthContext()
  const [ state, editor ] = useEditor(edit, validate, initialPollState)

  useEffect(() => {
    if (state.validated) {
      Promise.resolve()
        .then(async () => {
          const size = asNumber(state.value.size)
          const category = state.value.category as ProposalGrantCategory
          const tier = state.value.tier as ProposalGrantTier
          return Governance.get().createProposalGrant({
            ...state.value,
            category,
            tier,
            size
          })
        })
        .then((proposal) => {
            loader.proposals.set(proposal.id, proposal)
            navigate(locations.proposal(proposal.id), { replace: true })
        })
        .catch((err) => {
          console.error(err, { ...err })
          editor.error({ '*': err.body?.error || err.message })
        })
    }
  }, [ state.validated ])

  if (!account) {
    return <Container>
      <SignIn isConnecting={accountState.selecting || accountState.loading} onConnect={() => accountState.select()} />
    </Container>
  }

  return <ContentLayout small>
    <Helmet title={l('page.submit_grant.title') || ''} />
    <ContentSection>
      <Header size="huge">{l('page.submit_grant.title')}</Header>
    </ContentSection>
    <ContentSection className="MarkdownSection--tiny">
      {l.markdown('page.submit_grant.description')}
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_grant.category_label')}</Label>
      <SelectField
        value={state.value.category || undefined}
        placeholder={l('page.submit_grant.category_placeholder') || undefined}
        onChange={(_, { value }) => editor.set({ category: String(value) })}
        options={categories}
        error={!!state.error.category}
        message={l.optional(state.error.category)}
      />
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_grant.tier_label')}</Label>
      <SelectField
        value={state.value.tier || undefined}
        placeholder={l('page.submit_grant.tier_placeholder') || undefined}
        onChange={(_, { value }) => editor.set({ tier: String(value)})}
        options={tiers}
        error={!!state.error.tier}
        message={l.optional(state.error.tier)}
      />
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_grant.title_label')}</Label>
      <Field
        value={state.value.title}
        placeholder={l('page.submit_grant.title_placeholder')}
        onChange={(_, { value }) => editor.set({ title: value })}
        onBlur={() => editor.set({ title: state.value.title.trim() })}
        error={!!state.error.title}
        message={
          l.optional(state.error.title) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.title.length,
            limit: schema.title.maxLength
          })
        }
      />
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_grant.abstract_label')}</Label>
      <Paragraph tiny secondary className="details">{l('page.submit_grant.abstract_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.abstract}
        placeholder={l('page.submit_grant.abstract_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ abstract: value })}
        onBlur={() => editor.set({ abstract: state.value.abstract.trim() })}
        error={!!state.error.abstract}
        message={
          l.optional(state.error.abstract) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.abstract.length,
            limit: schema.abstract.maxLength
          })
        }
      />
    </ContentSection>
    <ContentSection className="GrantSize">
      <Label>{l('page.submit_grant.size_label')}</Label>
      <Paragraph tiny secondary className="details">{l('page.submit_grant.size_detail')}</Paragraph>
      <Field
        type="number"
        value={state.value.size}
        onChange={(_, { value }) => editor.set({ size: value })}
        error={!!state.error.size}
        action={<Paragraph tiny secondary>MANA</Paragraph>}
        onAction={() => null}
        message={l.optional(state.error.size)}
      />
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_grant.description_label')}</Label>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.description}
        placeholder={l('page.submit_grant.description_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ description: value })}
        onBlur={() => editor.set({ description: state.value.description.trim() })}
        error={!!state.error.description}
        message={
          l.optional(state.error.description) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.description.length,
            limit: schema.description.maxLength
          })
        }
      />
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_grant.specification_label')}</Label>
      <Paragraph tiny secondary className="details">{l('page.submit_grant.specification_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.specification}
        placeholder={l('page.submit_grant.specification_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ specification: value })}
        onBlur={() => editor.set({ specification: state.value.specification.trim() })}
        error={!!state.error.specification}
        message={
          l.optional(state.error.specification) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.specification.length,
            limit: schema.specification.maxLength
          })
        }
      />
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_grant.personnel_label')}</Label>
      <Paragraph tiny secondary className="details">{l('page.submit_grant.personnel_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.personnel}
        placeholder={l('page.submit_grant.personnel_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ personnel: value })}
        onBlur={() => editor.set({ personnel: state.value.personnel.trim() })}
        error={!!state.error.personnel}
        message={
          l.optional(state.error.personnel) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.personnel.length,
            limit: schema.personnel.maxLength
          })
        }
      />
    </ContentSection>
    <ContentSection>
      <Label>{l('page.submit_grant.roadmap_label')}</Label>
      <Paragraph tiny secondary className="details">{l('page.submit_grant.roadmap_detail')}</Paragraph>
      <MarkdownTextarea
        minHeight={175}
        value={state.value.roadmap}
        placeholder={l('page.submit_grant.roadmap_placeholder')}
        onChange={(_: any, { value }: any) => editor.set({ roadmap: value })}
        onBlur={() => editor.set({ roadmap: state.value.roadmap.trim() })}
        error={!!state.error.roadmap}
        message={
          l.optional(state.error.roadmap) + ' ' +
          l('page.submit.character_counter', {
            current: state.value.roadmap.length,
            limit: schema.roadmap.maxLength
          })
        }
      />
    </ContentSection>
    <ContentSection>
      <Button primary disabled={state.validated} loading={state.validated} onClick={() => editor.validate()}>
        {l('page.submit.button_submit')}
      </Button>
    </ContentSection>
    {state.error['*'] && <ContentSection>
      <Paragraph small primary>{l(state.error['*']) || state.error['*']}</Paragraph>
    </ContentSection>}
  </ContentLayout>
}
