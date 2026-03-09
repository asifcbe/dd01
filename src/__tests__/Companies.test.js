/**
 * Company API tests. Uses same sign-in credentials as authAndClient.test.js.
 *
 * @jest-environment node
 */

const { getAuthenticatedRequest } = require('./testHelpers');

let request;
const unique = `jest-${Date.now()}`;
let createdCompanyId = null;
let createdCompanyName = null;
let clonedCompanyId = null;

beforeAll(async () => {
  request = await getAuthenticatedRequest();
}, 15000);

describe('Companies', () => {
  test('Create company', async () => {
    const name = `Company ${unique}`;
    const payload = {
      name,
      email: `company-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      address: 'Test Address',
      country: 'India',
      tax_id: `TAX-${unique}`,
      reg_num: `REG-${unique}`,
      type1: 'Company',
      type2: 'Company',
      type3: 'NotApplicable',
    };
    const res = await request('POST', '/api/company', payload);
    if (!res.ok) throw new Error(`Create company failed: ${res.status} ${JSON.stringify(res.data)}`);
    const data = res.data || {};
    createdCompanyId = data.id || data.company_id;
    createdCompanyName = name;
    expect(createdCompanyId).toBeTruthy();
  }, 15000);

  test('Edit company', async () => {
    expect(createdCompanyId).toBeTruthy();
    const updatedName = `${createdCompanyName} – edited`;
    const res = await request('PATCH', `/api/company?company_id=${createdCompanyId}`, {
      id: createdCompanyId,
      name: updatedName,
      email: `company-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      address: 'Test Address',
      tax_id: '',
      reg_num: '',
      type2: 'Company',
    });
    expect(res.ok).toBe(true);
    createdCompanyName = updatedName;
  }, 15000);

  test('Clone company (create copy)', async () => {
    expect(createdCompanyId).toBeTruthy();
    const cloneName = `${createdCompanyName} (Copy)`;
    const payload = {
      name: cloneName,
      email: `company-clone-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      address: 'Test Address',
      country: 'India',
      tax_id: `tax-${unique}`,
      reg_num: `reg-${unique}`,
      type1: 'Company',
      type2: 'Company',
      type3: 'NotApplicable',
    };
    const res = await request('POST', '/api/company', payload);
    if (!res.ok) throw new Error(`Clone company failed: ${res.status} ${JSON.stringify(res.data)}`);
    const data = res.data || {};
    clonedCompanyId = data.id || data.company_id;
    expect(clonedCompanyId).toBeTruthy();
  }, 15000);

  // test('Delete cloned company', async () => {
  //   expect(clonedCompanyId).toBeTruthy();
  //   const res = await request('DELETE', `/api/company?company_id=${clonedCompanyId}`);
  //   expect(res.ok).toBe(true);
  // }, 15000);

  test('Load companies', async () => {
    const res = await request('GET', '/api/companies');
    expect(res.status).toBe(200);
  });

  test('Fetch companies count', async () => {
    const res = await request('GET', '/api/companies/count');
    expect(res.status).toBe(200);
  });
});
