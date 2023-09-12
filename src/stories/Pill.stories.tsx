import type { Meta, StoryObj } from '@storybook/react'

import Pill from '../components/Common/Pill'

const meta: Meta<typeof Pill> = {
  title: 'Common/Pill',
  component: Pill,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Pill>

export const Outline: Story = {
  args: {
    children: 'ENACTED',
    style: 'outline',
    size: 'md',
    color: 'green',
  },
}

export const Shiny: Story = {
  args: {
    children: 'REJECTED',
    style: 'shiny',
    size: 'md',
    color: 'red',
  },
}

export const Medium: Story = {
  args: {
    children: 'REJECTED',
    style: 'medium',
    size: 'md',
    color: 'red',
  },
}

export const Light: Story = {
  args: {
    children: 'REJECTED',
    style: 'light',
    size: 'md',
    color: 'red',
  },
}
