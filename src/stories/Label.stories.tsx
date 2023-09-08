import type { Meta, StoryObj } from '@storybook/react'

import Label from '../components/Common/Typography/Label'

const meta: Meta<typeof Label> = {
  title: 'Common/Typography/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: {
    children: 'Label',
  },
}
