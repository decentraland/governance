import { IntlProvider } from 'react-intl'

import { StoryFn } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import en from '../intl/en.json'
import { flattenMessages } from '../utils/intl'

const queryClient = new QueryClient()

export default function Providers(Story: StoryFn) {
  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider defaultLocale="en" locale="en" messages={flattenMessages(en)}>
        <Story />
      </IntlProvider>
    </QueryClientProvider>
  )
}
