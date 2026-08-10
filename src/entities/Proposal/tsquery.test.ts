import tsquery from './tsquery'

describe('tsquery', () => {
  describe('when the term holds a single space between words', () => {
    let result: string

    beforeEach(() => {
      result = tsquery('governance grant')
    })

    it('should prefix-match every word', () => {
      expect(result).toBe('governance:*&grant:*')
    })
  })

  describe('and the term holds a run of whitespace between the same words', () => {
    let result: string

    beforeEach(() => {
      result = tsquery('governance     grant')
    })

    // Collapsing the run must not change what is searched for, otherwise the guard below would be
    // trading a stall for wrong results.
    it('should produce the same query as a single space', () => {
      expect(result).toBe('governance:*&grant:*')
    })
  })

  // The parser's word pattern has three adjacent quantifiers whose classes all match whitespace, so
  // before the run was collapsed this input backtracked cubically: 3200 spaces took ~16s on the
  // request thread, and the route reaching it is unauthenticated.
  describe('when the term holds a long whitespace run the parser cannot match', () => {
    let elapsedMs: number

    beforeEach(() => {
      const startedAt = Date.now()
      tsquery(`ab|*${' '.repeat(40000)}`)
      elapsedMs = Date.now() - startedAt
    })

    // Bounded loosely on purpose. Cubic growth puts this input in the hours before the fix, so a
    // generous ceiling still separates the two behaviours and cannot be tripped by a slow runner.
    it('should parse without backtracking', () => {
      expect(elapsedMs).toBeLessThan(10000)
    })
  })
})
