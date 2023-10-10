import { Tabs } from 'decentraland-ui/dist/components/Tabs/Tabs'

import './BoxTabs.css'

class BoxTabs extends Tabs {
  render() {
    return (
      <div className="BoxTabs">
        <Tabs {...this.props} />
      </div>
    )
  }
}

export default BoxTabs
