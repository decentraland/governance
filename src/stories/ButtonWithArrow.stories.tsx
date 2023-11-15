import type { Meta, StoryObj } from '@storybook/react'

import ButtonWithArrow from '../components/Common/ButtonWithArrow'

export default {
  title: 'Components/ButtonWithArrow',
  component: ButtonWithArrow,
  parameters: {
    layout: 'centered',
  },
} as Meta

type Story = StoryObj<typeof ButtonWithArrow>

export const Default: Story = {
  args: {
    label: 'Click Me',
    arrowDirection: 'up',
    onClick: () => alert('Button clicked!'),
  },
}

export const DownArrow: Story = {
  args: {
    label: 'Click Me',
    arrowDirection: 'down',
    onClick: () => alert('Button clicked!'),
  },
}
