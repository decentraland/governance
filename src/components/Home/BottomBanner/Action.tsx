import React from 'react'

import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid/Grid'

import './Action.css'

export interface ActionProps {
  icon: JSX.Element
  title: string
  description: string
  url: string
}

function Action({ icon, title, description, url }: ActionProps) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="Action">
      <Grid>
        <Grid.Row>
          <Grid.Column width={3}>
            <div className="Action__Icon">{icon}</div>
          </Grid.Column>
          <Grid.Column width={13}>
            <div className="Action__Title">{title}</div>
            <div className="Action__Description">{description}</div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </a>
  )
}

export default Action
