import type { Meta, StoryObj } from '@storybook/react'

import SkeletonBarsComponent from '../components/Common/SkeletonBars'

const meta: Meta<typeof SkeletonBarsComponent> = {
  title: 'Common/SkeletonBars',
  component: SkeletonBarsComponent,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof SkeletonBarsComponent>

const Container = (props: any) => <div style={{ width: '250px' }} {...props} />

export const SkeletonBars: Story = {
  args: {
    amount: 3,
    height: 30,
    enableAnimation: true,
  },
  decorators: [
    (Story) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
}
