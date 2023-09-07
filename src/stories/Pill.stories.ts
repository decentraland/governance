import type { Meta, StoryObj } from '@storybook/react'

import Pill from '../components/Common/Pill'

const meta: Meta<typeof Pill> = {
  title: 'Common/Pill',
  component: Pill,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Pill text',
    },
  },
}

export default meta
type Story = StoryObj<typeof Pill>

export const Primary: Story = {
  args: {
    children: 'Text ',
  },
}
