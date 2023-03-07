import React from 'react'

import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon/Icon'
import Accordion from 'semantic-ui-react/dist/commonjs/modules/Accordion/Accordion'

function BreakdownAccordion() {
  return (
    <Accordion fluid styled>
      <Accordion.Title active={true} index={0}>
        <Icon name="dropdown" />
        What is a dog?
      </Accordion.Title>
      <Accordion.Content active={true}>
        <p>
          A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome
          guest in many households across the world.
        </p>
      </Accordion.Content>
    </Accordion>
  )
}

export default BreakdownAccordion
