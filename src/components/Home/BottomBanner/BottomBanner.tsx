import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import { DAO_DISCORD_URL, FORUM_URL, NEWSLETTER_URL } from '../../../constants'
import Discord from '../../Icon/Discord'
import EmailFilled from '../../Icon/EmailFilled'
import Megaphone from '../../Icon/Megaphone'

import Action, { ActionProps } from './Action'
import './BottomBanner.css'
import Stat from './Stat'

const ACTIONS: Record<string, ActionProps> = {
  discord: {
    icon: <Discord />,
    title: 'page.home.bottom_banner.discord_title',
    description: 'page.home.bottom_banner.discord_description',
    url: DAO_DISCORD_URL,
  },
  forum: {
    icon: <Megaphone />,
    title: 'page.home.bottom_banner.forum_title',
    description: 'page.home.bottom_banner.forum_description',
    url: FORUM_URL,
  },
  newsletter: {
    icon: <EmailFilled />,
    title: 'page.home.bottom_banner.newsletter_title',
    description: 'page.home.bottom_banner.newsletter_description',
    url: NEWSLETTER_URL,
  },
}

function BottomBanner() {
  const t = useFormatMessage()
  return (
    <div className="BottomBanner">
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <h2 className="BottomBanner__Title">{t('page.home.bottom_banner.title')}</h2>
            <div className="BottomBanner__Stats">
              <Stat title="Title1" description="Desc1" />
              <Stat title="Title2" description="Desc2" />
            </div>
          </Grid.Column>
          <Grid.Column floated="right" width={5}>
            <div className="BottomBanner__Actions">
              {Object.entries(ACTIONS).map(([key, props]) => (
                <Action
                  key={key}
                  icon={props.icon}
                  url={props.url}
                  title={t(props.title)}
                  description={t(props.description)}
                />
              ))}
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  )
}

export default BottomBanner
