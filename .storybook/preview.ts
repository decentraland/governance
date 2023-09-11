import type { Preview } from '@storybook/react'
import 'decentraland-ui/dist/themes/alternative/light-theme.css'
import 'decentraland-ui/dist/themes/base-theme.css'

import '../src/theme.css'
import '../src/ui-overrides.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
}

export default preview
