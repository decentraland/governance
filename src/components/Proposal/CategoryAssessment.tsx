import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { NewGrantCategory } from '../../entities/Grant/types'

import './CategoryAssessment.css'

interface Props {
  data: Record<string, string>
  category: NewGrantCategory
}

const CategoryAssessment = ({ data, category }: Props) => {
  const t = useFormatMessage()
  return (
    <div>
      {category === NewGrantCategory.Accelerator && (
        <>
          <h2 className="CategoryAssessment__Question">
            {t('page.submit_grant.category_assessment.accelerator.revenue_label')}
          </h2>
          <p className="CategoryAssessment__Text">{data.revenueGenerationModel}</p>
          <h2 className="CategoryAssessment__Question">
            {t('page.submit_grant.category_assessment.accelerator.return_of_investment_label')}
          </h2>
          <p className="CategoryAssessment__Text">{data.returnOfInvestmentPlan}</p>
          <h2 className="CategoryAssessment__Question">
            {t('page.submit_grant.category_assessment.accelerator.investment_recovery_label')}
          </h2>
          <p className="CategoryAssessment__Text">{data.investmentRecoveryTime}</p>
        </>
      )}
      {category === NewGrantCategory.CoreUnit && null}
      {category === NewGrantCategory.Documentation && null}
      {category === NewGrantCategory.InWorldContent && null}
      {category === NewGrantCategory.SocialMediaContent && null}
      {category === NewGrantCategory.Sponsorship && null}
    </div>
  )
}

export default CategoryAssessment
