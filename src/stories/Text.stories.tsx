import type { Meta, StoryObj } from '@storybook/react'

import Text from '../components/Common/Typography/Text'

const meta: Meta<typeof Text> = {
  title: 'Common/Typography/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Text>

export const Default: Story = {
  args: {
    children: 'Text',
    size: 'md',
    weight: 'normal',
    color: 'default',
    style: 'normal',
  },
}
