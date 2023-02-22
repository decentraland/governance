import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { NewGrantCategory } from '../../entities/Grant/types'

import AcceleratorSection, { AcceleratorQuestions } from './AcceleratorSection'
import CoreUnitSection, { CoreUnitQuestions } from './CoreUnitSection'
import DocumentationSection, { DocumentationQuestions } from './DocumentationSection'
import GrantRequestSection from './GrantRequestSection'
import InWorldContentSection, { InWorldContentQuestions } from './InWorldContentSection'
import SocialMediaContentSection, { SocialMediaContentQuestions } from './SocialMediaContent'
import SponsorshipSection, { SponsorshipQuestions } from './SponsorshipSection'

export type GrantRequestCategoryQuestions = {
  accelerator?: AcceleratorQuestions
  coreUnit?: CoreUnitQuestions
  documentation?: DocumentationQuestions
  inWorldContent?: InWorldContentQuestions
  socialMediaContent?: SocialMediaContentQuestions
  sponsorship?: SponsorshipQuestions
}

interface Props {
  category: NewGrantCategory
  onValidation: (data: GrantRequestCategoryQuestions, sectionValid: boolean) => void
  isFormDisabled: boolean
}

export default function GrantRequestCategorySection({ category, onValidation, isFormDisabled }: Props) {
  const t = useFormatMessage()

  const handleValidation = (data: Partial<GrantRequestCategoryQuestions>, validated: boolean) => {
    onValidation(data, validated)
  }

  return (
    <GrantRequestSection
      validated={true}
      isFormEdited={false}
      sectionTitle={t('page.submit_grant.category_assessment.title')}
      sectionNumber={3}
    >
      {category === NewGrantCategory.CoreUnit && (
        <CoreUnitSection onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
      {category === NewGrantCategory.Accelerator && (
        <AcceleratorSection onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
      {category === NewGrantCategory.Documentation && (
        <DocumentationSection onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
      {category === NewGrantCategory.InWorldContent && (
        <InWorldContentSection onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
      {category === NewGrantCategory.SocialMediaContent && (
        <SocialMediaContentSection onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
      {category === NewGrantCategory.Sponsorship && (
        <SponsorshipSection onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
    </GrantRequestSection>
  )
}
