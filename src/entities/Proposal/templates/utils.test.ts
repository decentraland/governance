import expected from './__data__/expected'
import markdown from './__data__/markdown'

import { formatMarkdown } from './utils'

describe('entities/Proposal/templates/utils', () => {
  test('formatMarkdown', () => {
    expect(formatMarkdown(markdown)).toBe(expected)
  })
})
