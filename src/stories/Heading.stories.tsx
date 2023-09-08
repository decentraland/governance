import type { Meta, StoryObj } from '@storybook/react'

import Heading from '../components/Common/Typography/Heading'

const meta: Meta<typeof Heading> = {
  title: 'Common/Typography/Heading',
  component: Heading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Heading>

export const Default: Story = {
  args: {
    children: 'Heading',
    size: 'lg',
    weight: 'bold',
    color: 'default',
  },
}
