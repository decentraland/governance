import React, { useRef } from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { NewGrantCategory } from '../../entities/Grant/types'

import AcceleratorSection, { AcceleratorQuestions } from './AcceleratorSection'
import CoreUnitSection, { CoreUnitQuestions } from './CoreUnitSection'
import DocumentationSection, { DocumentationQuestions } from './DocumentationSection'
import GrantRequestSection from './GrantRequestSection'
import InWorldContentSection, { InWorldContentQuestions } from './InWorldContentSection'
import SocialMediaContentSection, { SocialMediaContentQuestions } from './SocialMediaContentSection'
import SponsorshipSection, { SponsorshipQuestions } from './SponsorshipSection'

export type GrantRequestCategoryAssessment = {
  accelerator?: AcceleratorQuestions
  coreUnit?: CoreUnitQuestions
  documentation?: DocumentationQuestions
  inWorldContent?: InWorldContentQuestions
  socialMediaContent?: SocialMediaContentQuestions
  sponsorship?: SponsorshipQuestions
}

interface Props {
  category: NewGrantCategory
  onValidation: (data: GrantRequestCategoryAssessment, sectionValid: boolean) => void
  isFormDisabled: boolean
  sectionNumber: number
}

export default function GrantRequestCategorySection({ category, onValidation, isFormDisabled, sectionNumber }: Props) {
  const t = useFormatMessage()

  const sectionRef = useRef<{ validate: () => void; isValidated: () => boolean; isFormEdited: () => boolean }>(null)

  const handleBlur = () => {
    if (sectionRef) {
      sectionRef.current?.validate()
    }
  }

  const handleValidation = (data: Partial<GrantRequestCategoryAssessment>, validated: boolean) => {
    onValidation(data, validated)
  }

  return (
    <GrantRequestSection
      onBlur={handleBlur}
      validated={sectionRef.current?.isValidated() || false}
      isFormEdited={sectionRef.current?.isFormEdited() || false}
      sectionTitle={t('page.submit_grant.category_assessment.title')}
      sectionNumber={sectionNumber}
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
