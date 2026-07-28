/**
 * Every proposal type gates submission on the author's voting power, and the required amount comes
 * from the environment. validateSubmissionThreshold compares with `total < Number(threshold)`, and
 * Number(undefined) is NaN, so an unset variable makes that comparison false for every wallet and
 * the gate silently passes everyone.
 *
 * Checking at boot turns that into a loud failure at deploy time instead of an open gate nobody
 * notices. It is deliberately a hard failure: booting with an unusable threshold is the exact
 * situation this exists to prevent.
 */
const SUBMISSION_THRESHOLD_VARIABLES = [
  'GATSBY_SUBMISSION_THRESHOLD_POLL',
  'GATSBY_SUBMISSION_THRESHOLD_DRAFT',
  'GATSBY_SUBMISSION_THRESHOLD_GOVERNANCE',
  'GATSBY_SUBMISSION_THRESHOLD_PITCH',
  'GATSBY_SUBMISSION_THRESHOLD_TENDER',
  'GATSBY_SUBMISSION_THRESHOLD_HIRING',
  'GATSBY_SUBMISSION_THRESHOLD_GRANT',
  'SUBMISSION_THRESHOLD_COUNCIL_DECISION_VETO',
]

export function findUnusableSubmissionThresholds(env: NodeJS.ProcessEnv = process.env): string[] {
  return SUBMISSION_THRESHOLD_VARIABLES.filter((name) => {
    const value = env[name]
    if (value === undefined || value.trim().length === 0) {
      return true
    }
    const parsed = Number(value)
    return !Number.isFinite(parsed) || parsed < 0
  })
}

export function assertSubmissionThresholdsConfigured(env: NodeJS.ProcessEnv = process.env): void {
  const unusable = findUnusableSubmissionThresholds(env)
  if (unusable.length > 0) {
    throw new Error(
      `Refusing to start: submission thresholds are missing or not numbers: ${unusable.join(', ')}. ` +
        'Each must be set to a number, otherwise the voting power check passes for every wallet.'
    )
  }
}
