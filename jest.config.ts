import type { Config } from 'jest'

export default async (): Promise<Config> => {
  return {
    watchman: false,
    setupFiles: ['dotenv/config.js'],
    roots: ['<rootDir>/src/'],
    moduleNameMapper: {
      '\\.(css|less|sass|scss|gif|ttf|eot|svg)$': '<rootDir>/src/__mocks__/files.ts',
      '^gatsby-page-utils/(.*)$': 'gatsby-page-utils/dist/$1',
      '^@dcl/ui-env$': '<rootDir>/src/__mocks__/ui-env.ts'
    },
    transform: {
      '^.+\\.ts$': 'ts-jest'
    },
    testEnvironment: 'node',
    resolver: '<rootDir>/export-maps-resolver.js'
  }
}
