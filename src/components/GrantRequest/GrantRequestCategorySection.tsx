import { useCallback, useState } from 'react'

import { GrantRequestCategoryAssessment, NewGrantCategory } from '../../entities/Grant/types'
import useFormatMessage from '../../hooks/useFormatMessage'
import ProjectRequestSection from '../ProjectRequest/ProjectRequestSection'

import AcceleratorSection from './CategorySection/AcceleratorSection'
import CoreUnitSection from './CategorySection/CoreUnitSection'
import DocumentationSection from './CategorySection/DocumentationSection'
import InWorldContentSection from './CategorySection/InWorldContentSection'
import PlatformSection from './CategorySection/PlatformSection'
import SocialMediaContentSection from './CategorySection/SocialMediaContentSection'
import SponsorshipSection from './CategorySection/SponsorshipSection'

interface Props {
  category: NewGrantCategory
  onValidation: (data: GrantRequestCategoryAssessment, sectionValid: boolean) => void
  isFormDisabled: boolean
  sectionNumber: number
}

export default function GrantRequestCategorySection({ category, onValidation, isFormDisabled, sectionNumber }: Props) {
  const t = useFormatMessage()
  const [validated, setValidated] = useState<boolean | null>(null)
  const [isEdited, setIsEdited] = useState(false)

  const handleValidation = useCallback(
    (data: Partial<GrantRequestCategoryAssessment>, validated: boolean, isEdited: boolean) => {
      onValidation(data, validated)
      setValidated(validated)
      setIsEdited(isEdited)
    },
    [onValidation]
  )

  return (
    <ProjectRequestSection
      validated={!!validated}
      isFormEdited={isEdited}
      sectionTitle={t('page.submit_grant.category_assessment.title')}
      sectionNumber={sectionNumber}
    >
      {category === NewGrantCategory.Accelerator && (
        <AcceleratorSection onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
      {category === NewGrantCategory.CoreUnit && (
        <CoreUnitSection onValidation={handleValidation} isFormDisabled={isFormDisabled} />
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
      {category === NewGrantCategory.Platform && (
        <PlatformSection onValidation={handleValidation} isFormDisabled={isFormDisabled} />
      )}
    </ProjectRequestSection>
  )
}
