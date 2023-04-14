import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { kebabCase } from 'lodash'

import { ProposalAttributes, ProposalType } from '../../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../../helpers'

import './GetInvolvedQuestion.css'

export default function GetInvolvedQuestion({ proposal }: { proposal: ProposalAttributes }) {
  const t = useFormatMessage()
  const intl = useIntl()

  if (proposal?.type === ProposalType.Pitch || proposal?.type === ProposalType.Tender) {
    return <p className="GetInvolvedQuestion">{t(`page.proposal_detail.get_involved_${kebabCase(proposal?.type)}`)}</p>
  }

  if (proposal?.type === ProposalType.Grant) {
    return (
      <Markdown className="GetInvolvedQuestion">
        {t('page.proposal_detail.get_involved_grant', {
          value: intl.formatNumber(proposal?.configuration.size, CURRENCY_FORMAT_OPTIONS as any),
          category: proposal?.configuration.category,
        })}
      </Markdown>
    )
  }

  return null
}
