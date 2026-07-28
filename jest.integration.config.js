// Integration tests run against a real Postgres (see docker-compose.yml / CI). They reuse the unit
// jest config from package.json but point at test/ and compile with the test tsconfig (which
// includes the test/ directory).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseConfig = require('./package.json').jest

module.exports = {
  ...baseConfig,
  roots: ['<rootDir>/test/'],
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  testTimeout: 30000,
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
}
