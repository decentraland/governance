import { formatMarkdown } from './utils'
import markdown from './__data__/markdown'
import expected from './__data__/expected'

describe('entities/Proposal/templates/utils', () => {
  test('formatMarkdown', () => {
    expect(formatMarkdown(markdown)).toBe(expected)
  })
})