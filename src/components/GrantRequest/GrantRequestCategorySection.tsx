import React, { useRef } from 'react'

import { GrantRequestCategoryAssessment, NewGrantCategory } from '../../entities/Grant/types'
import useFormatMessage from '../../hooks/useFormatMessage'

import AcceleratorSection from './CategorySection/AcceleratorSection'
import CoreUnitSection from './CategorySection/CoreUnitSection'
import DocumentationSection from './CategorySection/DocumentationSection'
import InWorldContentSection from './CategorySection/InWorldContentSection'
import PlatformSection from './CategorySection/PlatformSection'
import SocialMediaContentSection from './CategorySection/SocialMediaContentSection'
import SponsorshipSection from './CategorySection/SponsorshipSection'

import GrantRequestSection from './GrantRequestSection'

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
      {category === NewGrantCategory.Platform && (
        <PlatformSection ref={sectionRef} onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
    </GrantRequestSection>
  )
}
