/**
 * Developer API tests. Uses same sign-in credentials as authAndClient.test.js.
 *
 * @jest-environment node
 */

const { getAuthenticatedRequest } = require('./testHelpers');

let request;
const unique = `jest-${Date.now()}`;
let createdDeveloperId = null;
let createdDeveloperName = null;
let clonedDeveloperId = null;

beforeAll(async () => {
  request = await getAuthenticatedRequest();
}, 15000);

describe('Developers', () => {
  test('Create developer', async () => {
    const name = `Developer ${unique}`.slice(0, 10);
    const payload = {
      name,
      email: `developer-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      country: 'India',
      address: 'Test Address',
      type1: 'Developer',
      type2: 'NotApplicable',
      type3: 'NotApplicable',
    };
    const res = await request('POST', '/api/developer', payload);
    if (!res.ok) throw new Error(`Create developer failed: ${res.status} ${JSON.stringify(res.data)}`);
    const data = res.data || {};
    createdDeveloperId = data.id || data.developer_id;
    createdDeveloperName = name;
    expect(createdDeveloperId).toBeTruthy();
  }, 15000);

  test('Edit developer', async () => {
    expect(createdDeveloperId).toBeTruthy();
    const updatedName = `${createdDeveloperName} – edited`;
    const res = await request('PATCH', `/api/developer?developer_id=${createdDeveloperId}`, {
      id: createdDeveloperId,
      name: updatedName,
      email: `developer-${unique}@example.com`,
      country: 'India',
      mobile: String(Math.random()).slice(2, 12),
      address: 'Test Address',
      type2: 'NotApplicable',
      type3: 'NotApplicable',
    });
    expect(res.ok).toBe(true);
    createdDeveloperName = updatedName;
  }, 15000);

  test('Clone developer (create copy)', async () => {
    expect(createdDeveloperId).toBeTruthy();
    const cloneName = `${createdDeveloperName} (Copy)`;
    const payload = {
      name: cloneName,
      email: `developer-clone-${unique}@example.com`,
      mobile: String(Math.random()).slice(2, 12),
      address: 'Test Address',
      country: 'India',
      type1: 'Developer',
      type2: 'NotApplicable',
      type3: 'NotApplicable',
    };
    const res = await request('POST', '/api/developer', payload);
    if (!res.ok) throw new Error(`Clone developer failed: ${res.status} ${JSON.stringify(res.data)}`);
    const data = res.data || {};
    clonedDeveloperId = data.id || data.developer_id;
    expect(clonedDeveloperId).toBeTruthy();
  }, 15000);

  // test('Delete cloned developer', async () => {
  //   expect(clonedDeveloperId).toBeTruthy();
  //   const res = await request('DELETE', `/api/developer?developer_id=${clonedDeveloperId}`);
  //   expect(res.ok).toBe(true);
  // }, 15000);

  test('Load developers', async () => {
    const res = await request('GET', '/api/developers');
    expect(res.status).toBe(200);
  });

  test('Fetch developers count', async () => {
    const res = await request('GET', '/api/developers/count');
    expect(res.status).toBe(200);
  });
});
