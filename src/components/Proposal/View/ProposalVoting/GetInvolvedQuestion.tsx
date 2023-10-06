import { useIntl } from 'react-intl'

import kebabCase from 'lodash/kebabCase'

import { ProposalAttributes, ProposalType } from '../../../../entities/Proposal/types'
import { CURRENCY_FORMAT_OPTIONS } from '../../../../helpers'
import useFormatMessage from '../../../../hooks/useFormatMessage'
import Markdown from '../../../Common/Typography/Markdown'
import Text from '../../../Common/Typography/Text'

import './GetInvolvedQuestion.css'

export default function GetInvolvedQuestion({ proposal }: { proposal: ProposalAttributes }) {
  const t = useFormatMessage()
  const intl = useIntl()

  const { type, configuration } = proposal

  if (type === ProposalType.Pitch || type === ProposalType.Tender) {
    return (
      <Text weight="semi-bold" className="GetInvolvedQuestion">
        {t(`page.proposal_detail.get_involved_${kebabCase(type)}`)}
      </Text>
    )
  }

  if (type === ProposalType.Grant) {
    return (
      <Markdown componentsClassNames={{ p: 'GetInvolvedQuestion__Text' }}>
        {t('page.proposal_detail.get_involved_grant', {
          value: intl.formatNumber(configuration.size, CURRENCY_FORMAT_OPTIONS),
          category: configuration.category,
        })}
      </Markdown>
    )
  }

  return null
}
