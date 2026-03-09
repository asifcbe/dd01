/**
 * Bank API tests. Uses same sign-in credentials as authAndClient.test.js.
 *
 * @jest-environment node
 */

const { getAuthenticatedRequest } = require('./testHelpers');

let request;
const unique = `jest-${Date.now()}`;
let createdBankId = null;
let createdBankName = null;
let clonedBankId = null;

beforeAll(async () => {
  request = await getAuthenticatedRequest();
}, 15000);

describe('Banks', () => {
  test('Create bank', async () => {
    const name = `Bank ${unique}`.slice(0, 10);
    const payload = {
      name,
      code: `${unique}`.slice(0, 10),
      swift_code: `${unique}`.slice(0, 10),
      country: 'India',
      branch: 'Test Branch',
      city: 'Test City',
      account_number: `${unique}`.slice(0, 10),
      account_holder_name: `${unique}`.slice(0, 10),
      type1: 'Bank',
      type2: 'Bank',
      type3: 'NotApplicable',
    };
    const res = await request('POST', '/api/bank', payload);
    if (!res.ok) throw new Error(`Create bank failed: ${res.status} ${JSON.stringify(res.data)}`);
    const data = res.data || {};
    createdBankId = data.id || data.bank_id;
    createdBankName = name;
    expect(createdBankId).toBeTruthy();
  }, 15000);

  test('Edit bank', async () => {
    expect(createdBankId).toBeTruthy();
    const updatedName = `${createdBankName} – edited`.slice(0, 10);
    const res = await request('PATCH', `/api/bank?bank_id=${createdBankId}`, {
      id: createdBankId,
      name: updatedName,
      code: `${unique}`.slice(0, 10),
      swift_code: `${unique}`.slice(0, 10),
      country: 'India',
      branch: 'Test Branch',
      city: 'Test City',
      account_number: `${unique}`.slice(0, 10),
      account_holder_name: `${unique}`.slice(0, 10),
      type2: 'Bank',
    });
    expect(res.ok).toBe(true);
    createdBankName = updatedName;
  }, 15000);

  test('Clone bank (create copy)', async () => {
    expect(createdBankId).toBeTruthy();
    const cloneName = `${createdBankName} (Copy)`.slice(1, 10);
    const payload = {
      name: cloneName,
      code: `${unique}`.slice(1, 10),
      swift_code: `${unique}`.slice(1, 10),
      country: 'India',
      branch: 'Test Branch',
      city: 'Test City',
      account_number: `${unique}`.slice(1, 10),
      account_holder_name: `${unique}`.slice(1, 10),
      type1: 'Bank',
      type2: 'Bank',
      type3: 'NotApplicable',
    };
    const res = await request('POST', '/api/bank', payload);
    if (!res.ok) throw new Error(`Clone bank failed: ${res.status} ${JSON.stringify(res.data)}`);
    const data = res.data || {};
    clonedBankId = data.id || data.bank_id;
    expect(clonedBankId).toBeTruthy();
  }, 15000);

  // test('Delete cloned bank', async () => {
  //   expect(clonedBankId).toBeTruthy();
  //   const res = await request('DELETE', `/api/bank?bank_id=${clonedBankId}`);
  //   expect(res.ok).toBe(true);
  // }, 15000);

  test('Load banks', async () => {
    const res = await request('GET', '/api/banks');
    expect(res.status).toBe(200);
  });

  test('Fetch banks count', async () => {
    const res = await request('GET', '/api/banks/count');
    expect(res.status).toBe(200);
  });
});
