/**
 * Templates and Invoices API tests. Uses same sign-in credentials as authAndClient.test.js.
 *
 * @jest-environment node
 */

const { getAuthenticatedRequest } = require('./testHelpers');

let request;

beforeAll(async () => {
  request = await getAuthenticatedRequest();
}, 15000);

describe('Templates and invoices', () => {
  test('Fetch templates count', async () => {
    const res = await request('GET', '/api/templates/count');
    expect(res.status).toBe(200);
  });

  test('Fetch invoices count', async () => {
    const res = await request('GET', '/api/invoices/count');
    expect(res.status).toBe(200);
  });
});
