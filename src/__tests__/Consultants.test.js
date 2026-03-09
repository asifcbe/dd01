/**
 * Consultant API tests. Uses same sign-in credentials as authAndClient.test.js.
 *
 * @jest-environment node
 */

const { getAuthenticatedRequest } = require('./testHelpers');

let request;
const unique = `jest-${Date.now()}`;
let createdConsultantId = null;
let createdConsultantName = null;
let clonedConsultantId = null;

beforeAll(async () => {
  request = await getAuthenticatedRequest();
}, 15000);

describe('Consultants', () => {
  test('Create consultant', async () => {
    const name = `Consultant ${unique}`.slice(0, 10);
    const payload = {
      name,
      email: `consultant-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      country: 'India',
      address: 'Test Address',
      expense_limit: 1000,
      type: 'PartTime',
      type1: 'Consultant',
      type2: 'Individual',
      type3: 'NotApplicable',
    };
    const res = await request('POST', '/api/consultant', payload);
    if (!res.ok) throw new Error(`Create consultant failed: ${res.status} ${JSON.stringify(res.data)}`);
    const data = res.data || {};
    createdConsultantId = data.id || data.consultant_id;
    createdConsultantName = name;
    expect(createdConsultantId).toBeTruthy();
  }, 15000);

  test('Edit consultant', async () => {
    expect(createdConsultantId).toBeTruthy();
    const updatedName = `${createdConsultantName} – edited`;
    const res = await request('PATCH', `/api/consultant?consultant_id=${createdConsultantId}`, {
      id: createdConsultantId,
      name: updatedName,
      email: `consultant-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      country: 'India',
      address: 'Test Address',
      expense_limit: 1000,
      type: 'PartTime',
      type2: 'Individual',
    });
    expect(res.ok).toBe(true);
    createdConsultantName = updatedName;
  }, 15000);

  test('Clone consultant (create copy)', async () => {
    expect(createdConsultantId).toBeTruthy();
    const cloneName = `${createdConsultantName} (Copy)`;
    const payload = {
      name: cloneName,
      email: `consultant-clone-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      country: 'India',
      address: 'Test Address',
      expense_limit: 1000,
      type: 'PartTime',
      type2: 'Individual',
      type3: 'NotApplicable',
    };
    const res = await request('POST', '/api/consultant', payload);
    if (!res.ok) throw new Error(`Clone consultant failed: ${res.status} ${JSON.stringify(res.data)}`);
    const data = res.data || {};
    clonedConsultantId = data.id || data.consultant_id;
    expect(clonedConsultantId).toBeTruthy();
  }, 15000);

  // test('Delete cloned consultant', async () => {
  //   expect(clonedConsultantId).toBeTruthy();
  //   const res = await request('DELETE', `/api/consultant?consultant_id=${clonedConsultantId}`);
  //   expect(res.ok).toBe(true);
  // }, 15000);

  test('Load consultants', async () => {
    const res = await request('GET', '/api/consultants');
    expect(res.status).toBe(200);
  });

  test('Fetch consultants count', async () => {
    const res = await request('GET', '/api/consultants/count');
    expect(res.status).toBe(200);
  });
});
