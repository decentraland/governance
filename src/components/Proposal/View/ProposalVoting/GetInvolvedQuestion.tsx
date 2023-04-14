import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import useFormatMessage, { useIntl } from 'decentraland-gatsby/dist/hooks/useFormatMessage'

import { ProposalAttributes, ProposalType } from '../../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../../helpers'

import './GetInvolvedQuestion.css'

export default function GetInvolvedQuestion({ proposal }: { proposal: ProposalAttributes }) {
  const t = useFormatMessage()
  const intl = useIntl()

  if (proposal?.type === ProposalType.Pitch) {
    return <p className="GetInvolvedQuestion">{t('page.proposal_bidding_tendering.get_involved_question')}</p>
  }

  if (proposal?.type === ProposalType.Grant) {
    return (
      <Markdown className="GetInvolvedQuestion">
        {t('page.proposal_view.grant.header', {
          value: intl.formatNumber(proposal?.configuration.size, CURRENCY_FORMAT_OPTIONS as any),
          category: proposal?.configuration.category,
        })}
      </Markdown>
    )
  }

  return null
}
