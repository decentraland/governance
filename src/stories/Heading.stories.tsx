import type { Meta, StoryObj } from '@storybook/react'

import HeadingComponent from '../components/Common/Typography/Heading'

const meta: Meta<typeof HeadingComponent> = {
  title: 'Common/Typography/Heading',
  component: HeadingComponent,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof HeadingComponent>

export const Heading: Story = {
  args: {
    children: 'Heading',
    size: 'lg',
    weight: 'bold',
    color: 'default',
  },
}
