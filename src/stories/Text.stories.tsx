import type { Meta, StoryObj } from '@storybook/react'

import TextComponent from '../components/Common/Typography/Text'

const meta: Meta<typeof TextComponent> = {
  title: 'Common/Typography/Text',
  component: TextComponent,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof TextComponent>

export const Text: Story = {
  args: {
    children: 'Text',
    size: 'md',
    weight: 'normal',
    color: 'default',
    style: 'normal',
  },
}
