import { assertSubmissionThresholdsConfigured, findUnusableSubmissionThresholds } from './configurationChecks'

const CONFIGURED: NodeJS.ProcessEnv = {
  GATSBY_SUBMISSION_THRESHOLD_POLL: '100',
  GATSBY_SUBMISSION_THRESHOLD_DRAFT: '100',
  GATSBY_SUBMISSION_THRESHOLD_GOVERNANCE: '100',
  GATSBY_SUBMISSION_THRESHOLD_PITCH: '100',
  GATSBY_SUBMISSION_THRESHOLD_TENDER: '100',
  GATSBY_SUBMISSION_THRESHOLD_HIRING: '100',
  GATSBY_SUBMISSION_THRESHOLD_GRANT: '100',
  SUBMISSION_THRESHOLD_COUNCIL_DECISION_VETO: '100',
}

describe('findUnusableSubmissionThresholds', () => {
  describe('when every threshold is a number', () => {
    it('should report nothing unusable', () => {
      expect(findUnusableSubmissionThresholds(CONFIGURED)).toEqual([])
    })
  })

  describe('when a threshold is zero', () => {
    it('should accept it, since a gate that requires nothing is a deliberate setting', () => {
      expect(findUnusableSubmissionThresholds({ ...CONFIGURED, GATSBY_SUBMISSION_THRESHOLD_POLL: '0' })).toEqual([])
    })
  })

  // The failure this guards: Number(undefined) is NaN and every comparison against NaN is false,
  // so the voting power check would pass for a wallet holding nothing.
  describe('when a threshold is missing', () => {
    it('should report that variable', () => {
      const env = { ...CONFIGURED }
      delete env.GATSBY_SUBMISSION_THRESHOLD_POLL
      expect(findUnusableSubmissionThresholds(env)).toEqual(['GATSBY_SUBMISSION_THRESHOLD_POLL'])
    })
  })

  describe('when a threshold is an empty string', () => {
    it('should report that variable', () => {
      expect(findUnusableSubmissionThresholds({ ...CONFIGURED, GATSBY_SUBMISSION_THRESHOLD_GRANT: '' })).toEqual([
        'GATSBY_SUBMISSION_THRESHOLD_GRANT',
      ])
    })
  })

  describe('when a threshold is whitespace', () => {
    it('should report that variable', () => {
      expect(findUnusableSubmissionThresholds({ ...CONFIGURED, GATSBY_SUBMISSION_THRESHOLD_GRANT: '   ' })).toEqual([
        'GATSBY_SUBMISSION_THRESHOLD_GRANT',
      ])
    })
  })

  describe('when a threshold is not a number', () => {
    it('should report that variable', () => {
      expect(findUnusableSubmissionThresholds({ ...CONFIGURED, GATSBY_SUBMISSION_THRESHOLD_TENDER: 'lots' })).toEqual([
        'GATSBY_SUBMISSION_THRESHOLD_TENDER',
      ])
    })
  })

  describe('when a threshold is negative', () => {
    it('should report that variable', () => {
      expect(findUnusableSubmissionThresholds({ ...CONFIGURED, GATSBY_SUBMISSION_THRESHOLD_HIRING: '-1' })).toEqual([
        'GATSBY_SUBMISSION_THRESHOLD_HIRING',
      ])
    })
  })

  // This one has no GATSBY_ prefix and was absent from .env.example, so it is the variable most
  // likely to be unset in a real environment.
  describe('when the council decision veto threshold is missing', () => {
    it('should report it like any other', () => {
      const env = { ...CONFIGURED }
      delete env.SUBMISSION_THRESHOLD_COUNCIL_DECISION_VETO
      expect(findUnusableSubmissionThresholds(env)).toEqual(['SUBMISSION_THRESHOLD_COUNCIL_DECISION_VETO'])
    })
  })

  describe('when several thresholds are unusable', () => {
    it('should report all of them, so one deploy fixes the lot', () => {
      const env = { ...CONFIGURED, GATSBY_SUBMISSION_THRESHOLD_POLL: '', GATSBY_SUBMISSION_THRESHOLD_DRAFT: 'nope' }
      expect(findUnusableSubmissionThresholds(env)).toEqual([
        'GATSBY_SUBMISSION_THRESHOLD_POLL',
        'GATSBY_SUBMISSION_THRESHOLD_DRAFT',
      ])
    })
  })
})

describe('assertSubmissionThresholdsConfigured', () => {
  describe('when every threshold is configured', () => {
    it('should not throw', () => {
      expect(() => assertSubmissionThresholdsConfigured(CONFIGURED)).not.toThrow()
    })
  })

  describe('when a threshold is unusable', () => {
    let env: NodeJS.ProcessEnv

    beforeEach(() => {
      env = { ...CONFIGURED }
      delete env.SUBMISSION_THRESHOLD_COUNCIL_DECISION_VETO
    })

    it('should refuse to start', () => {
      expect(() => assertSubmissionThresholdsConfigured(env)).toThrow('Refusing to start')
    })

    it('should name the variable that has to be set', () => {
      expect(() => assertSubmissionThresholdsConfigured(env)).toThrow('SUBMISSION_THRESHOLD_COUNCIL_DECISION_VETO')
    })
  })
})
