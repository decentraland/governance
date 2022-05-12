import React from 'react';



import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown';
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage';
import { Popup } from 'decentraland-ui/dist/components/Popup/Popup';



import Info from '../../Icon/Info';
import VotingPower from '../../Token/VotingPower';
import Username from '../../User/Username';



import './DelegationsLabel.css';


export interface DelegationsLabelProps {
  delegateLabel?: { id: string; values?: any }
  delegatorsLabel?: { id: string; values?: any }
  infoMessage?: { id: string; values?: any }
}

function formatInfoMessage(infoMessage: { id: string; values?: any } | undefined) {
  if (infoMessage && infoMessage.values) {
    if (infoMessage.values.delegate) {
      infoMessage.values.delegate = <Username className="DelegationsLabel__InfoMessage" address={infoMessage.values.delegate} addressOnly />
    }
    if (infoMessage.values.own_vp) {
      infoMessage.values.own_vp = <VotingPower className="DelegationsLabel__InfoMessage" value={infoMessage.values.own_vp} />
    }
    if (infoMessage.values.delegated_vp) {
      infoMessage.values.delegated_vp = <VotingPower className="DelegationsLabel__InfoMessage" value={infoMessage.values.delegated_vp} />
    }
  }
}

const DelegationsLabel = ({ delegateLabel, delegatorsLabel, infoMessage }: DelegationsLabelProps) => {
  const t = useFormatMessage()
  formatInfoMessage(infoMessage)

  return (
    <div className="DelegationsLabel">
      <span className="DelegationsLabel__TextContainer">
        {delegateLabel && (
          <Markdown className="DelegationsLabel__Text">{t(delegateLabel.id, delegateLabel.values)}</Markdown>
        )}
        {delegatorsLabel && (
          <Markdown className="DelegationsLabel__Text">{t(delegatorsLabel.id, delegatorsLabel.values)}</Markdown>
        )}
      </span>

      {infoMessage && (
        <Popup
          content={<span>{t(infoMessage.id, infoMessage.values)}</span>}
          position="left center"
          trigger={
            <div className="DelegationsLabel__PopupContainer">
              <Info className={'DelegationsLabel__Info'} width="14" height="14" />
            </div>
          }
          on="hover"
          hoverable
        />
      )}
    </div>
  )
}

export default DelegationsLabel
