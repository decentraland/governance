import { Popup } from 'decentraland-ui/dist/components/Popup/Popup'

import useFormatMessage from '../../../../hooks/useFormatMessage'
import Markdown from '../../../Common/Typography/Markdown'
import Username from '../../../Common/Username'
import Info from '../../../Icon/Info'
import VotingPower from '../../../Token/VotingPower'

import './DelegationsLabel.css'

interface InfoMessageValues {
  delegate?: string
  own_vp?: number
  delegators_that_voted?: number
  total_delegators?: number
  delegators_without_vote?: number
}

export interface DelegationsLabelProps {
  delegateLabel?: { id: string; values?: any }
  delegatorsLabel?: { id: string; values?: any }
  infoMessage?: { id: string; values?: InfoMessageValues }
}

function formatInfoMessageValues(values?: any) {
  const formattedInfoValues: {
    delegate?: JSX.Element
    own_vp?: JSX.Element
    delegated_vp?: JSX.Element
  } = {}

  if (values) {
    if (values.delegate) {
      formattedInfoValues.delegate = (
        <Username className="DelegationsLabel__InfoMessage" address={values.delegate} variant="address" />
      )
    }
    if (values.own_vp) {
      formattedInfoValues.own_vp = <VotingPower className="DelegationsLabel__InfoMessage" value={values.own_vp} />
    }
    if (values.delegated_vp) {
      formattedInfoValues.delegated_vp = (
        <VotingPower className="DelegationsLabel__InfoMessage" value={values.delegated_vp} />
      )
    }
  }
  return { ...values, ...formattedInfoValues }
}

const DelegationsLabel = ({ delegateLabel, delegatorsLabel, infoMessage }: DelegationsLabelProps) => {
  const t = useFormatMessage()
  const formattedInfoValues = formatInfoMessageValues(infoMessage?.values)

  return (
    <div className="DelegationsLabel">
      <span className="DelegationsLabel__TextContainer">
        {delegateLabel && (
          <Markdown
            size="sm"
            className="DelegationsLabel__Text"
            componentsClassNames={{ p: 'DelegationsLabel__TextSpacing' }}
          >
            {t(delegateLabel.id, delegateLabel.values)}
          </Markdown>
        )}
        {delegatorsLabel && (
          <Markdown
            size="sm"
            className="DelegationsLabel__Text"
            componentsClassNames={{ p: 'DelegationsLabel__TextSpacing' }}
          >
            {t(delegatorsLabel.id, delegatorsLabel.values)}
          </Markdown>
        )}
      </span>

      {infoMessage && (
        <Popup
          content={t(infoMessage.id, formattedInfoValues)}
          position="left center"
          trigger={
            <div className={'DelegationsLabel__HelperContainer'}>
              <Info className={'DelegationsLabel__HelperIcon'} size={'14'} />
            </div>
          }
          on="hover"
          hoverable
          className={`DelegationsLabel__HelperContainer--Popup`}
        />
      )}
    </div>
  )
}

export default DelegationsLabel
