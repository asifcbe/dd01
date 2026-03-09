/**
 * Projects/Contracts API tests. Uses same sign-in credentials as authAndClient.test.js.
 *
 * @jest-environment node
 */

const { getAuthenticatedRequest } = require('./testHelpers');

let request;

beforeAll(async () => {
  request = await getAuthenticatedRequest();
}, 15000);

describe('Projects and contracts', () => {
  test('Load contracts', async () => {
    const res = await request('GET', '/api/projects?type=CompanyToDeveloper');
    expect(res.status).toBe(200);
  });

  test('Load projects', async () => {
    const res = await request('GET', '/api/projects?type=CompanyToDeveloper');
    expect(res.status).toBe(200);
  });

  test('Fetch contracts count', async () => {
    const res = await request('GET', '/api/projects/count?type=CompanyToDeveloper');
    expect(res.status).toBe(200);
  });

  test('Fetch projects count', async () => {
    const res = await request('GET', '/api/projects/count?type=CompanyToDeveloper');
    expect(res.status).toBe(200);
  });
});
