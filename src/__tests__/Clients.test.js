/**
 * Client API tests. Uses same sign-in credentials as authAndClient.test.js.
 * Run authAndClient.test.js first so .test-credentials.json exists.
 *
 * @jest-environment node
 */

const { getAuthenticatedRequest } = require('./testHelpers');

let request;
const unique = `jest-${Date.now()}`;
let createdClientId = null;
let createdClientName = null;
let clonedClientId = null;

beforeAll(async () => {
  request = await getAuthenticatedRequest();
}, 15000);

describe('Clients', () => {
  test('Create client', async () => {
    const name = `Client ${unique}`;
    const payload = {
      name,
      email: `client-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      address: 'Test Address',
      country: 'India',
      tax_id: `TAX-${unique}`,
      reg_num: `REG-${unique}`,
      type: 'Individual',
      type1: 'Client',
      type2: 'Individual',
      type3: 'NotApplicable',
    };
    const res = await request('POST', '/api/client', payload);
    if (!res.ok) {
      throw new Error(`Create client failed: ${res.status} ${JSON.stringify(res.data)}`);
    }
    const data = res.data || {};
    createdClientId = data.id || data.client_id;
    createdClientName = name;
    expect(createdClientId).toBeTruthy();
  }, 15000);

  test('Edit client', async () => {
    expect(createdClientId).toBeTruthy();
    const updatedName = `${createdClientName} – edited`;
    const res = await request('PATCH', `/api/client?client_id=${createdClientId}`, {
      id: createdClientId,
      name: updatedName,
      email: `client-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      address: 'Test Address',
      tax_id: '',
      reg_num: '',
      type: 'Individual',
      type2: 'Individual',
    });
    expect(res.ok).toBe(true);
    createdClientName = updatedName;
  }, 15000);

  test('Clone client (create copy)', async () => {
    expect(createdClientId).toBeTruthy();
    const cloneName = `${createdClientName} (Copy)`;
    const payload = {
      name: cloneName,
      email: `client-clone-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      address: 'Test Address',
      country: 'India',
      tax_id: `tax-${unique}`,
      reg_num: `reg-${unique}`,
      type: 'Individual',
      type1: 'Client',
      type2: 'Individual',
      type3: 'NotApplicable',
    };
    const res = await request('POST', '/api/client', payload);
    if (!res.ok) {
      throw new Error(`Clone client failed: ${res.status} ${JSON.stringify(res.data)}`);
    }
    const data = res.data || {};
    clonedClientId = data.id || data.client_id;
    expect(clonedClientId).toBeTruthy();
  }, 15000);

  // test('Delete cloned client', async () => {
  //   expect(clonedClientId).toBeTruthy();
  //   const res = await request('DELETE', `/api/client?client_id=${clonedClientId}`);
  //   expect(res.ok).toBe(true);
  // }, 15000);

  test('Load clients', async () => {
    const res = await request('GET', '/api/clients');
    expect(res.status).toBe(200);
  });

  test('Fetch clients count', async () => {
    const res = await request('GET', '/api/clients/count');
    expect(res.status).toBe(200);
  });
});
