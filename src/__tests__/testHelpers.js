/**
 * Shared test helpers: API base, request helper, and auth using credentials
 * from authAndClient.test.js (sign up → sign in → write .test-credentials.json).
 * Other test files call getAuthenticatedRequest() in beforeAll to sign in with the same creds.
 *
 * Run the full integration suite with: npm run test:integration
 * (--runInBand ensures authAndClient.test.js runs first and creates .test-credentials.json)
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

const API_BASE = (process.env.API_BASE || process.env.INTEGRATION_API_BASE || 'https://invoice-generator-bq6g.onrender.com/invoice-generator').replace(/\/$/, '');

const CREDENTIALS_PATH = path.join(__dirname, '.test-credentials.json');

function readCredentials() {
  try {
    const data = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    throw new Error('Run authAndClient.test.js first (Sign up + Sign in) to create .test-credentials.json');
  }
}

function writeCredentials(org, email, password) {
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify({ org, email, password }, null, 2), 'utf8');
}

/**
 * Create a request function that uses the given auth cookie.
 */
function createRequest(authCookie) {
  return async function request(method, path, body = null, { useAuth = true } = {}) {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(useAuth && authCookie ? { Cookie: authCookie } : {}),
    };
    const config = { method, url, headers, maxRedirects: 0, validateStatus: () => true };
    if (body && (method === 'POST' || method === 'PATCH')) config.data = body;
    const res = await axios(config);
    return { ok: res.status >= 200 && res.status < 300, status: res.status, data: res.data };
  };
}

/**
 * Sign in using credentials from .test-credentials.json and return
 * a request function that sends the session cookie.
 */
async function getAuthenticatedRequest() {
  const { org, email, password } = readCredentials();
  const url = `${API_BASE}/api/signin`;
  const res = await axios({
    method: 'POST',
    url,
    headers: { 'Content-Type': 'application/json' },
    data: { org: org.trim(), email: email.trim(), password },
    maxRedirects: 0,
    validateStatus: () => true,
  });
  if (res.status !== 200) {
    throw new Error(`Sign in failed: ${res.status} ${JSON.stringify(res.data)}`);
  }
  const setCookie = res.headers['set-cookie'];
  const authCookie = setCookie
    ? (Array.isArray(setCookie) ? setCookie.map((c) => c.split(';')[0]).join('; ') : setCookie.split(';')[0])
    : null;
  if (!authCookie) throw new Error('Sign in did not return a session cookie');
  return createRequest(authCookie);
}

module.exports = {
  API_BASE,
  CREDENTIALS_PATH,
  readCredentials,
  writeCredentials,
  createRequest,
  getAuthenticatedRequest,
};
