import React, { useRef } from 'react'

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

  const sectionRef = useRef<{ validate: () => void; isValidated: () => boolean }>(null)

  const handleBlur = () => {
    if (sectionRef) {
      sectionRef.current?.validate()
    }
  }

  const handleValidation = (data: Partial<GrantRequestCategoryQuestions>, validated: boolean) => {
    onValidation(data, validated)
  }

  return (
    <GrantRequestSection
      onBlur={handleBlur}
      validated={sectionRef.current?.isValidated() || false}
      isFormEdited={sectionRef.current?.isValidated() || false}
      sectionTitle={t('page.submit_grant.category_assessment.title')}
      sectionNumber={3}
    >
      {category === NewGrantCategory.Accelerator && (
        <AcceleratorSection ref={sectionRef} onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
      {category === NewGrantCategory.CoreUnit && (
        <CoreUnitSection ref={sectionRef} onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
      {category === NewGrantCategory.Documentation && (
        <DocumentationSection ref={sectionRef} onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
      {category === NewGrantCategory.InWorldContent && (
        <InWorldContentSection ref={sectionRef} onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
      {category === NewGrantCategory.SocialMediaContent && (
        <SocialMediaContentSection ref={sectionRef} onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
      {category === NewGrantCategory.Sponsorship && (
        <SponsorshipSection ref={sectionRef} onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
    </GrantRequestSection>
  )
}
