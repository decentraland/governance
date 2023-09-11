import type { Meta, StoryObj } from '@storybook/react'

import LabelComponent from '../components/Common/Typography/Label'

const meta: Meta<typeof LabelComponent> = {
  title: 'Common/Typography/Label',
  component: LabelComponent,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof LabelComponent>

export const Label: Story = {
  args: {
    children: 'Label',
  },
}
