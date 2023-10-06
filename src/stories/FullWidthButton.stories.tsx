import type { Meta, StoryObj } from '@storybook/react'

import FullWidthButtonComponent from '../components/Common/FullWidthButton'

const meta: Meta<typeof FullWidthButtonComponent> = {
  title: 'Common/FullWidthButton',
  component: FullWidthButtonComponent,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof FullWidthButtonComponent>

const Container = (props: any) => <div style={{ width: '85vw', maxWidth: '768px' }} {...props} />

export const FullWidthButton: Story = {
  args: {
    children: 'View all proposals',
  },
  decorators: [
    (Story) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
}
