import React from 'react'

import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import Charts from './Charts'
import './CommunityEngagement.css'
import TopVoters from './TopVoters'

function CommunityEngagement() {
  const t = useFormatMessage()
  return (
    <div className="CommunityEngagement">
      <div className="CommunityEngagement__Header">
        <Header>{t('page.home.community_engagement.title')}</Header>
        <p>{t('page.home.community_engagement.description')}</p>
      </div>
      <Grid stackable>
        <Grid.Row>
          <Grid.Column width={11}>
            <Charts />
          </Grid.Column>
          <Grid.Column width={5}>
            <TopVoters />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  )
}

export default CommunityEngagement
