import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { NewGrantCategory } from '../../entities/Grant/types'

import './CategoryAssessment.css'

interface Props {
  data: Record<string, string>
  category: NewGrantCategory
}

const CategoryAssessmentItem = ({ label, children }: { label: string; children: string }) => {
  return (
    <>
      <h2 className="CategoryAssessment__Question">{label}</h2>
      <p className="CategoryAssessment__Text">{children}</p>
    </>
  )
}

const CategoryAssessment = ({ data, category }: Props) => {
  const t = useFormatMessage()
  return (
    <div>
      {category === NewGrantCategory.Accelerator && (
        <>
          <CategoryAssessmentItem label={t('page.submit_grant.category_assessment.accelerator.revenue_label')}>
            {data.revenueGenerationModel}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem
            label={t('page.submit_grant.category_assessment.accelerator.return_of_investment_label')}
          >
            {data.returnOfInvestmentPlan}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem
            label={t('page.submit_grant.category_assessment.accelerator.investment_recovery_label')}
          >
            {data.investmentRecoveryTime}
          </CategoryAssessmentItem>
        </>
      )}
      {category === NewGrantCategory.CoreUnit && (
        <>
          <CategoryAssessmentItem label={t('page.submit_grant.category_assessment.core_unit.strategic_value_label')}>
            {data.strategicValue}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem label={t('page.submit_grant.category_assessment.core_unit.impact_metrics_label')}>
            {data.impactMetrics}
          </CategoryAssessmentItem>
        </>
      )}
      {category === NewGrantCategory.Documentation && (
        <>
          <CategoryAssessmentItem label={t('page.submit_grant.category_assessment.documentation.content_type.label')}>
            {data.contentType}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem label={t('page.submit_grant.category_assessment.documentation.total_pieces_label')}>
            {data.totalPieces}
          </CategoryAssessmentItem>
        </>
      )}
      {category === NewGrantCategory.InWorldContent && (
        <>
          <CategoryAssessmentItem
            label={t('page.submit_grant.category_assessment.in_world_content.total_pieces_label')}
          >
            {data.totalPieces}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem label={t('page.submit_grant.category_assessment.in_world_content.total_users_label')}>
            {data.totalUsers}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem
            label={t('page.submit_grant.category_assessment.in_world_content.engagement_measurement_label')}
          >
            {data.engagementMeasurement}
          </CategoryAssessmentItem>
        </>
      )}
      {category === NewGrantCategory.SocialMediaContent && (
        <>
          <CategoryAssessmentItem
            label={t('page.submit_grant.category_assessment.social_media_content.social_media_platforms.label')}
          >
            {data.socialMediaPlatforms}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem
            label={t('page.submit_grant.category_assessment.social_media_content.audience_relevance_label')}
          >
            {data.audienceRelevance}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem
            label={t('page.submit_grant.category_assessment.social_media_content.total_pieces_label')}
          >
            {data.totalPieces}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem
            label={t('page.submit_grant.category_assessment.social_media_content.total_impact_label')}
          >
            {data.totalPeopleImpact}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem
            label={t('page.submit_grant.category_assessment.social_media_content.relevant_link_label')}
          >
            {data.relevantLink}
          </CategoryAssessmentItem>
        </>
      )}
      {category === NewGrantCategory.Sponsorship && (
        <>
          <CategoryAssessmentItem label={t('page.submit_grant.category_assessment.sponsorship.event_type.label')}>
            {data.eventType}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem label={t('page.submit_grant.category_assessment.sponsorship.event_category.label')}>
            {data.eventCategory}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem
            label={t('page.submit_grant.category_assessment.sponsorship.primary_source_funding_label')}
          >
            {data.primarySourceFunding}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem label={t('page.submit_grant.category_assessment.sponsorship.total_events_label')}>
            {data.totalEvents}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem label={t('page.submit_grant.category_assessment.sponsorship.total_attendance_label')}>
            {data.totalAttendance}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem
            label={t('page.submit_grant.category_assessment.sponsorship.audience_relevance_label')}
          >
            {data.audienceRelevance}
          </CategoryAssessmentItem>
          <CategoryAssessmentItem label={t('page.submit_grant.category_assessment.sponsorship.showcase_label')}>
            {data.showcase}
          </CategoryAssessmentItem>
        </>
      )}
    </div>
  )
}

export default CategoryAssessment
