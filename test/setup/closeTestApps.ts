import { closeTestApps } from '../../src/routes/testApp'

// Route suites bind a listener per router; this shuts them down when the file finishes so a long
// run does not hold one open per suite. A no-op for files that never build one.
afterAll(async () => {
  await closeTestApps()
})
