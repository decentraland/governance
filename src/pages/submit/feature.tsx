import React, { useEffect, useState } from "react"
import Helmet from "react-helmet"
import { navigate } from "gatsby-plugin-intl"
import { Button } from "decentraland-ui/dist/components/Button/Button"
import { Header } from "decentraland-ui/dist/components/Header/Header"
import { Field } from "decentraland-ui/dist/components/Field/Field"
import { Container } from "decentraland-ui/dist/components/Container/Container"
import { Loader } from "decentraland-ui/dist/components/Loader/Loader"
import { SignIn } from "decentraland-ui/dist/components/SignIn/SignIn"
import { SelectField } from "decentraland-ui/dist/components/SelectField/SelectField"
import {
  isProposalFeatureProduct,
  newProposalFeatureScheme,
  ProposalFeatureProduct,
} from "../../entities/Proposal/types"
import Paragraph from "decentraland-gatsby/dist/components/Text/Paragraph"
import MarkdownTextarea from "decentraland-gatsby/dist/components/Form/MarkdownTextarea"
import useFormatMessage from "decentraland-gatsby/dist/hooks/useFormatMessage"
import useEditor, {
  assert,
  createValidator,
} from "decentraland-gatsby/dist/hooks/useEditor"
import ContentLayout, {
  ContentSection,
} from "../../components/Layout/ContentLayout"
import { Governance } from "../../api/Governance"
import loader from "../../modules/loader"
import locations from "../../modules/locations"
import Label from "decentraland-gatsby/dist/components/Form/Label"
import useAuthContext from "decentraland-gatsby/dist/context/Auth/useAuthContext"
import Head from "decentraland-gatsby/dist/components/Head/Head"
import MarkdownNotice from "../../components/Form/MarkdownNotice"
import "./submit.css"

type FeatureState = {
  title: string
  product: string | null
  explanation: string
}

const initialFeatureState: FeatureState = {
  title: "",
  product: null,
  explanation: "",
}

const products = [
  {
    key: ProposalFeatureProduct.Marketplace,
    text: ProposalFeatureProduct.Marketplace,
    value: ProposalFeatureProduct.Marketplace,
  },
]

const schema = newProposalFeatureScheme.properties
const edit = (state: FeatureState, props: Partial<FeatureState>) => {
  return {
    ...state,
    ...props,
  }
}

const validate = createValidator<FeatureState>({
  title: (state) => ({
    title:
      assert(
        state.title.length <= schema.title.maxLength,
        "error.feature.title_too_large"
      ) || undefined,
  }),
  product: (state) => ({
    product:
      assert(
        !state.product || isProposalFeatureProduct(state.product),
        "error.feature.product_invalid"
      ) || undefined,
  }),
  explanation: (state) => ({
    explanation:
      assert(
        state.explanation.length <= schema.explanation.maxLength,
        "error.feature.explanation_too_large"
      ) || undefined,
  }),
  "*": (state) => ({
    title:
      assert(state.title.length > 0, "error.feature.title_empty") ||
      assert(
        state.title.length >= schema.title.minLength,
        "error.feature.title_too_short"
      ) ||
      assert(
        state.title.length <= schema.title.maxLength,
        "error.feature.title_too_large"
      ),
    product:
      assert(!!state.product, "error.feature.product_empty") ||
      assert(
        isProposalFeatureProduct(state.product),
        "error.feature.product_invalid"
      ),
    explanation:
      assert(state.explanation.length > 0, "error.feature.explanation_empty") ||
      assert(
        state.explanation.length >= schema.explanation.minLength,
        "error.feature.explanation_too_short"
      ) ||
      assert(
        state.explanation.length <= schema.explanation.maxLength,
        "error.feature.explanation_too_large"
      ),
  }),
})

export default function SubmitFeatureRequest() {
  const l = useFormatMessage()
  const [account, accountState] = useAuthContext()
  const [state, editor] = useEditor(edit, validate, initialFeatureState)
  const [formDisabled, setFormDisabled] = useState(false)

  useEffect(() => {
    if (state.validated) {
      setFormDisabled(true)
      Promise.resolve()
        .then(async () => {
          const product = state.value.product as ProposalFeatureProduct

          return Governance.get().createProposalFeature({
            ...state.value,
            product,
          })
        })
        .then((proposal) => {
          loader.proposals.set(proposal.id, proposal)
          navigate(locations.proposal(proposal.id, { new: "true" }), {
            replace: true,
          })
        })
        .catch((err) => {
          console.error(err, { ...err })
          editor.error({ "*": err.body?.error || err.message })
          setFormDisabled(false)
        })
    }
  }, [state.validated])

  if (accountState.loading) {
    return (
      <Container className="WelcomePage">
        <div>
          <Loader size="huge" active />
        </div>
      </Container>
    )
  }

  if (!account) {
    return (
      <Container>
        <Head
          title={l("page.submit_feature.title") || ""}
          description={l("page.submit_feature.description") || ""}
          image="https://decentraland.org/images/decentraland.png"
        />
        <SignIn
          isConnecting={accountState.selecting || accountState.loading}
          onConnect={() => accountState.select()}
        />
      </Container>
    )
  }

  return (
    <ContentLayout small>
      <Head
        title={l("page.submit_feature.title") || ""}
        description={l("page.submit_feature.description") || ""}
        image="https://decentraland.org/images/decentraland.png"
      />
      <Helmet title={l("page.submit_feature.title") || ""} />
      <ContentSection>
        <Header size="huge">{l("page.submit_feature.title")}</Header>
      </ContentSection>
      <ContentSection className="MarkdownSection--tiny">
        {l.markdown("page.submit_feature.description")}
      </ContentSection>
      <ContentSection>
        <Label>{l("page.submit_feature.title_label")}</Label>
        <Paragraph tiny secondary className="details">
          {l("page.submit_feature.title_detail")}
        </Paragraph>
        <Field
          value={state.value.title}
          placeholder={l("page.submit_feature.title_placeholder")}
          onChange={(_, { value }) => editor.set({ title: value })}
          onBlur={() => editor.set({ title: state.value.title.trim() })}
          error={!!state.error.title}
          message={
            l.optional(state.error.title) +
            " " +
            l("page.submit.character_counter", {
              current: state.value.title.length,
              limit: schema.title.maxLength,
            })
          }
          disabled={formDisabled}
        />
      </ContentSection>
      <ContentSection>
        <Label>{l("page.submit_feature.product_label")}</Label>
        <SelectField
          value={state.value.product || undefined}
          placeholder={
            l("page.submit_feature.product_placeholder") || undefined
          }
          onChange={(_, { value }) => editor.set({ product: String(value) })}
          options={products}
          error={!!state.error.product}
          message={l.optional(state.error.product)}
          disabled={formDisabled}
        />
      </ContentSection>
      <ContentSection>
        <Label>
          {l("page.submit_feature.explanation_label")}
          <MarkdownNotice />
        </Label>
        <Paragraph tiny secondary className="details">
          {l("page.submit_feature.explanation_detail")}
        </Paragraph>
        <MarkdownTextarea
          minHeight={175}
          value={state.value.explanation}
          placeholder={l("page.submit_feature.explanation_placeholder")}
          onChange={(_: any, { value }: any) =>
            editor.set({ explanation: value })
          }
          onBlur={() =>
            editor.set({ explanation: state.value.explanation.trim() })
          }
          error={!!state.error.explanation}
          message={
            l.optional(state.error.explanation) +
            " " +
            l("page.submit.character_counter", {
              current: state.value.explanation.length,
              limit: schema.explanation.maxLength,
            })
          }
          disabled={formDisabled}
        />
      </ContentSection>
      <ContentSection>
        <Button
          primary
          disabled={state.validated}
          loading={state.validated}
          onClick={() => editor.validate()}
        >
          {l("page.submit.button_submit")}
        </Button>
      </ContentSection>
      {state.error["*"] && (
        <ContentSection>
          <Paragraph small primary>
            {l(state.error["*"]) || state.error["*"]}
          </Paragraph>
        </ContentSection>
      )}
    </ContentLayout>
  )
}
