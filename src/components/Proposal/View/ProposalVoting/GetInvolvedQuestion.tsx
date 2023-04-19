import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import kebabCase from 'lodash/kebabCase'

import { ProposalAttributes, ProposalType } from '../../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../../helpers'

import './GetInvolvedQuestion.css'

export default function GetInvolvedQuestion({ proposal }: { proposal: ProposalAttributes }) {
  const t = useFormatMessage()
  const intl = useIntl()

  const { type, configuration } = proposal

  if (type === ProposalType.Pitch || type === ProposalType.Tender) {
    return <p className="GetInvolvedQuestion">{t(`page.proposal_detail.get_involved_${kebabCase(type)}`)}</p>
  }

  if (type === ProposalType.Grant) {
    return (
      <Markdown className="GetInvolvedQuestion">
        {t('page.proposal_detail.get_involved_grant', {
          value: intl.formatNumber(configuration.size, CURRENCY_FORMAT_OPTIONS as any),
          category: configuration.category,
        })}
      </Markdown>
    )
  }

  return null
}
