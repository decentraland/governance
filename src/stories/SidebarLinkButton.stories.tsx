import type { Meta, StoryObj } from '@storybook/react'

import Forum from '../components/Icon/Forum'
import OpenFolder from '../components/Icon/OpenFolder'
import SidebarLinkButton from '../components/Proposal/View/SidebarLinkButton'

const meta: Meta<typeof SidebarLinkButton> = {
  title: 'Common/SidebarLinkButton',
  component: SidebarLinkButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SidebarLinkButton>

const Container = (props: any) => <div style={{ width: '250px' }} {...props} />

export const External: Story = {
  args: {
    icon: <Forum size={20} />,
    isExternal: true,
    children: 'Discuss in the forum',
  },
  decorators: [
    (Story) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
}

export const Internal: Story = {
  args: {
    icon: <OpenFolder size={20} />,
    isExternal: false,
    children: 'View all proposals',
  },
  decorators: [
    (Story) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
}
