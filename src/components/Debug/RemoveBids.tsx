import React from 'react'

import { Button } from 'decentraland-ui/dist/components/Button/Button'

import { Governance } from '../../clients/Governance'
import Heading from '../Common/Typography/Heading'
import { ContentSection } from '../Layout/ContentLayout'

function RemoveBids({ className }: { className?: string }) {
  return (
    <div className={className}>
      <ContentSection>
        <Heading size="sm">{'Remove Pending Bids'}</Heading>
        <Button className="Debug__SectionButton" primary onClick={() => Governance.get().removeAllPendingBids()}>
          {'Remove'}
        </Button>
      </ContentSection>
    </div>
  )
}

export default RemoveBids
