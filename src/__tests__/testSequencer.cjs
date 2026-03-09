/**
 * Ensures authAndClient.test.js runs first so .test-credentials.json exists
 * for other integration tests that use getAuthenticatedRequest().
 */
const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    const copy = [...tests];
    const authTest = copy.find((t) => t.path.includes('authAndClient.test'));
    const rest = copy.filter((t) => !t.path.includes('authAndClient.test'));
    rest.sort((a, b) => a.path.localeCompare(b.path));
    return authTest ? [authTest, ...rest] : rest;
  }
}

module.exports = CustomSequencer;
