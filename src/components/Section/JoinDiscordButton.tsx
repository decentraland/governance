import React from 'react'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import TokenList from 'decentraland-gatsby/dist/utils/dom/TokenList'

import './DetailsSection.css'
import './SectionButton.css'
import { JOIN_DISCORD_URL } from '../../entities/Proposal/utils'

const discordIcon = require('../../images/icons/discord.svg')
const openIcon = require('../../images/icons/open.svg')

export type JoinDiscordButtonProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
  loading?: boolean,
  disabled?: boolean,
}

export default React.memo(function JoinDiscordButton({ loading, disabled, ...props }: JoinDiscordButtonProps) {
  const l = useFormatMessage()
  return <a href={JOIN_DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={TokenList.join([
              'DetailsSection',
              'SectionButton',
              loading && 'SectionButton--loading',
              disabled && 'SectionButton--disabled',
              props.className
            ])}>
    <Loader active={loading} size="small" />
    <img src={discordIcon} width="20" height="20"/>
    <span>{l('page.treasury.join_discord_button')}</span>
    <img src={openIcon} width="12" height="12"/>
  </a>
})
