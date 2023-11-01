import type { Meta, StoryObj } from '@storybook/react'

import LinkWithTitleComponent from '../components/Common/Typography/LinkWithTitle'

import Providers from './Providers'

const meta: Meta<typeof LinkWithTitleComponent> = {
  title: 'Common/LinkWithTitle',
  component: LinkWithTitleComponent,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof LinkWithTitleComponent>

export const LinkWithTitle: Story = {
  args: {
    url: 'https://governance.decentraland.org',
  },
  decorators: [Providers],
}
