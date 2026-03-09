/**
 * Vendor API tests. Uses same sign-in credentials as authAndClient.test.js.
 *
 * @jest-environment node
 */

const { getAuthenticatedRequest } = require('./testHelpers');

let request;
const unique = `jest-${Date.now()}`;
let createdVendorId = null;
let createdVendorName = null;
let clonedVendorId = null;

beforeAll(async () => {
  request = await getAuthenticatedRequest();
}, 15000);

describe('Vendors', () => {
  test('Create vendor', async () => {
    const name = `Vendor ${unique}`;
    const payload = {
      name,
      email: `vendor-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      address: 'Test Address',
      country: 'India',
      type1: 'Vendor',
      type2: 'Company',
      type3: 'NotApplicable',
    };
    const res = await request('POST', '/api/vendor', payload);
    if (!res.ok) throw new Error(`Create vendor failed: ${res.status} ${JSON.stringify(res.data)}`);
    const data = res.data || {};
    createdVendorId = data.id || data.vendor_id;
    createdVendorName = name;
    expect(createdVendorId).toBeTruthy();
  }, 15000);

  test('Edit vendor', async () => {
    expect(createdVendorId).toBeTruthy();
    const updatedName = `${createdVendorName} – edited`;
    const res = await request('PATCH', `/api/vendor?vendor_id=${createdVendorId}`, {
      id: createdVendorId,
      name: updatedName,
      email: `vendor-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      address: 'Test Address',
      country: 'India',
      type2: 'Company',
    });
    expect(res.ok).toBe(true);
    createdVendorName = updatedName;
  }, 15000);

  test('Clone vendor (create copy)', async () => {
    expect(createdVendorId).toBeTruthy();
    const cloneName = `${createdVendorName} (Copy)`;
    const payload = {
      name: cloneName,
      email: `vendor-clone-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      address: 'Test Address',
      country: 'India',
      type1: 'Vendor',
      type2: 'Company',
      type3: 'NotApplicable',
    };
    const res = await request('POST', '/api/vendor', payload);
    if (!res.ok) throw new Error(`Clone vendor failed: ${res.status} ${JSON.stringify(res.data)}`);
    const data = res.data || {};
    clonedVendorId = data.id || data.vendor_id;
    expect(clonedVendorId).toBeTruthy();
  }, 15000);

  // test('Delete cloned vendor', async () => {
  //   expect(clonedVendorId).toBeTruthy();
  //   const res = await request('DELETE', `/api/vendor?vendor_id=${clonedVendorId}`);
  //   expect(res.ok).toBe(true);
  // }, 15000);

  test('Load vendors', async () => {
    const res = await request('GET', '/api/vendors');
    expect(res.status).toBe(200);
  });

  test('Fetch vendors count', async () => {
    const res = await request('GET', '/api/vendors/count');
    expect(res.status).toBe(200);
  });
});
