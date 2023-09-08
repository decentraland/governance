import React from 'react'

module.exports = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    config.module.rules[0].exclude = [/node_modules\/(?!(gatsby|gatsby-script)\/)/]
    if (parseInt(React.version) <= 18) {
      config.externals = ['react-dom/client']
    }
    config.module.rules[0].exclude = [/core-js/]
    config.resolve.mainFields = ['browser', 'module', 'main']
    return config
  },
}
