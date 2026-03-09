/**
 * Jest tests: Sign up → Sign in. Writes credentials to .test-credentials.json
 * so other test files (Clients, Companies, etc.) can sign in with the same creds.
 *
 * Run this first, then run other tests. Same API base as testHelpers.js.
 *   API_BASE=https://invoice-generator-bq6g.onrender.com/invoice-generator npm test
 *
 * @jest-environment node
 */

const axios = require('axios');
const { API_BASE, writeCredentials } = require('./testHelpers');

const unique = `jest-${Date.now()}`;
const org = `Org ${unique}`;
const email = `test-${unique}@example.com`;
const password = 'TestPassword123!';

let authCookie = null;

async function request(method, path, body = null, { useAuth = true } = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(useAuth && authCookie ? { Cookie: authCookie } : {}),
  };
  const config = { method, url, headers, maxRedirects: 0, validateStatus: () => true };
  if (body && (method === 'POST' || method === 'PATCH')) config.data = body;
  const res = await axios(config);
  const setCookie = res.headers['set-cookie'];
  if (setCookie) {
    authCookie = Array.isArray(setCookie) ? setCookie.map((c) => c.split(';')[0]).join('; ') : setCookie.split(';')[0];
  }
  return { ok: res.status >= 200 && res.status < 300, status: res.status, data: res.data };
}

describe('Auth (sign up and sign in)', () => {
  test('Authorization (unauthenticated returns 401)', async () => {
    const res = await request('GET', '/api/me');
    expect(res.status).toBe(401);
  });

  test('Sign up', async () => {
    const res = await request(
      'POST',
      '/api/signup',
      {
        org: org.trim(),
        email: email.trim(),
        password,
      },
      { useAuth: false }
    );
    expect([201, 200]).toContain(res.status);
  }, 15000);

  test('Sign in and save credentials for other tests', async () => {
    const res = await request(
      'POST',
      '/api/signin',
      {
        org: org.trim(),
        email: email.trim(),
        password,
      },
      { useAuth: false }
    );
    expect(res.status).toBe(200);
    expect(authCookie).toBeTruthy();
    writeCredentials(org.trim(), email.trim(), password);
  }, 15000);

  test('Log out', async () => {
    const res = await request('POST', '/api/signout');
    expect(res.status).toBe(200);
  });
});
