/**
 * Populates the app with dummy data. Logs in with credentials and creates
 * sample clients, companies, banks, vendors, developers, consultants, projects, and contracts.
 *
 * CREDENTIALS (set one of these):
 *   1. Edit CREDENTIALS below: { org: 'My Org', email: 'me@example.com', password: 'MyPass123!' }
 *   2. Env vars: POPULATE_ORG=testorga4 POPULATE_EMAIL=testorga4@gm.com POPULATE_PASSWORD=secret
 *   3. Run authAndClient.test.js first to create .test-credentials.json (used if 1 & 2 are empty)
 *
 * API_BASE: Set API_BASE or INTEGRATION_API_BASE env var for a different server.
 *
 * Run: npm run populate
 * Or:  npm test -- populateData
 *
 * @jest-environment node
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

const API_BASE = (process.env.API_BASE || process.env.INTEGRATION_API_BASE || 'https://invoice-generator-bq6g.onrender.com/invoice-generator').replace(/\/$/, '');
const CREDENTIALS_PATH = path.join(__dirname, '.test-credentials.json');

// =============================================================================
// CREDENTIALS: Set your own { org, email, password } here, or leave null to use
// .test-credentials.json. Env vars POPULATE_ORG, POPULATE_EMAIL, POPULATE_PASSWORD
// override both.
// =============================================================================
const CREDENTIALS = null; // e.g. { org: 'My Org', email: 'me@example.com', password: 'MyPass123!' }

function getCredentials() {
  if (process.env.POPULATE_ORG && process.env.POPULATE_EMAIL && process.env.POPULATE_PASSWORD) {
    return {
      org: process.env.POPULATE_ORG,
      email: process.env.POPULATE_EMAIL,
      password: process.env.POPULATE_PASSWORD,
    };
  }
  if (CREDENTIALS && CREDENTIALS.org && CREDENTIALS.email && CREDENTIALS.password) {
    return CREDENTIALS;
  }
  try {
    const data = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    throw new Error(
      'No credentials. Either: (1) Set CREDENTIALS in this file, (2) Set POPULATE_ORG, POPULATE_EMAIL, POPULATE_PASSWORD env vars, or (3) Run authAndClient.test.js first to create .test-credentials.json'
    );
  }
}

async function signIn(org, email, password) {
  const res = await axios({
    method: 'POST',
    url: `${API_BASE}/api/signin`,
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
  return authCookie;
}

async function request(authCookie, method, path, body = null) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const config = {
    method,
    url,
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookie,
    },
    maxRedirects: 0,
    validateStatus: () => true,
  };
  if (body && (method === 'POST' || method === 'PATCH')) config.data = body;
  const res = await axios(config);
  return { ok: res.status >= 200 && res.status < 300, status: res.status, data: res.data };
}

const unique = `populate-${Date.now()}`;

describe('Populate dummy data', () => {
  let authCookie;
  let createdIds = {};

  beforeAll(async () => {
    const { org, email, password } = getCredentials();
    authCookie = await signIn(org, email, password);
  }, 15000);

  const req = (method, path, body) => request(authCookie, method, path, body);

  test('Create clients', async () => {
    const payloads = [
      { name: `Client A ${unique}`, email: `client-a-${unique}@example.com`, mobile: '1111111111', address: '123 Main St', country: 'India', tax_id: '', reg_num: '', type: 'Individual', type1: 'Client', type2: 'Individual', type3: 'NotApplicable' },
      { name: `Client B ${unique}`, email: `client-b-${unique}@example.com`, mobile: '2222222222', address: '456 Oak Ave', country: 'India', tax_id: '', reg_num: '', type: 'Individual', type1: 'Client', type2: 'Individual', type3: 'NotApplicable' },
    ];
    createdIds.clients = [];
    for (const p of payloads) {
      const res = await req('POST', '/api/client', p);
      if (!res.ok) throw new Error(`Create client failed: ${res.status} ${JSON.stringify(res.data)}`);
      const id = res.data?.id || res.data?.client_id;
      if (id) createdIds.clients.push(id);
    }
    expect(createdIds.clients.length).toBeGreaterThan(0);
  }, 15000);

  test('Create companies', async () => {
    const payloads = [
      { name: `Company A ${unique}`, email: `company-a-${unique}@example.com`, mobile: '3333333333', address: '789 Biz Rd', country: 'India', tax_id: '', reg_num: '', type1: 'Company', type2: 'Company', type3: 'NotApplicable' },
      { name: `Company B ${unique}`, email: `company-b-${unique}@example.com`, mobile: '4444444444', address: '101 Corp Blvd', country: 'India', tax_id: '', reg_num: '', type1: 'Company', type2: 'Company', type3: 'NotApplicable' },
    ];
    createdIds.companies = [];
    for (const p of payloads) {
      const res = await req('POST', '/api/company', p);
      if (!res.ok) throw new Error(`Create company failed: ${res.status} ${JSON.stringify(res.data)}`);
      const id = res.data?.id || res.data?.company_id;
      if (id) createdIds.companies.push(id);
    }
    expect(createdIds.companies.length).toBeGreaterThan(0);
  }, 15000);

  test('Create bank', async () => {
    const payload = {
      name: `Bank ${unique}`.slice(0, 20),
      code: `B${unique}`.slice(0, 10),
      swift_code: `SW${unique}`.slice(0, 10),
      country: 'India',
      branch: 'Main Branch',
      city: 'Mumbai',
      account_number: `ACC${unique}`.slice(0, 15),
      account_holder_name: `Holder ${unique}`.slice(0, 20),
      type1: 'Bank',
      type2: 'Bank',
      type3: 'NotApplicable',
    };
    const res = await req('POST', '/api/bank', payload);
    if (!res.ok) throw new Error(`Create bank failed: ${res.status} ${JSON.stringify(res.data)}`);
    createdIds.bank = res.data?.id || res.data?.bank_id;
    expect(createdIds.bank).toBeTruthy();
  }, 15000);

  test('Create vendors', async () => {
    const payloads = [
      { name: `Vendor A ${unique}`, email: `vendor-a-${unique}@example.com`, mobile: '5555555555', address: '202 Supply St', country: 'India', type1: 'Vendor', type2: 'Company', type3: 'NotApplicable' },
      { name: `Vendor B ${unique}`, email: `vendor-b-${unique}@example.com`, mobile: '6666666666', address: '303 Vendor Ave', country: 'India', type1: 'Vendor', type2: 'Company', type3: 'NotApplicable' },
    ];
    createdIds.vendors = [];
    for (const p of payloads) {
      const res = await req('POST', '/api/vendor', p);
      if (!res.ok) throw new Error(`Create vendor failed: ${res.status} ${JSON.stringify(res.data)}`);
      const id = res.data?.id || res.data?.vendor_id;
      if (id) createdIds.vendors.push(id);
    }
    expect(createdIds.vendors.length).toBeGreaterThan(0);
  }, 15000);

  test('Create developers', async () => {
    const payloads = [
      { name: `Dev A ${unique}`.slice(0, 20), email: `dev-a-${unique}@example.com`, mobile: '7777777777', country: 'India', address: '404 Code Ln', type1: 'Developer', type2: 'NotApplicable', type3: 'NotApplicable' },
      { name: `Dev B ${unique}`.slice(0, 20), email: `dev-b-${unique}@example.com`, mobile: '8888888888', country: 'India', address: '505 Dev Rd', type1: 'Developer', type2: 'NotApplicable', type3: 'NotApplicable' },
    ];
    createdIds.developers = [];
    for (const p of payloads) {
      const res = await req('POST', '/api/developer', p);
      if (!res.ok) throw new Error(`Create developer failed: ${res.status} ${JSON.stringify(res.data)}`);
      const id = res.data?.id || res.data?.developer_id;
      if (id) createdIds.developers.push(id);
    }
    expect(createdIds.developers.length).toBeGreaterThan(0);
  }, 15000);

  test('Create consultants', async () => {
    const payloads = [
      { name: `Consult A ${unique}`.slice(0, 20), email: `consult-a-${unique}@example.com`, mobile: '9999999999', country: 'India', address: '606 Consult St', expense_limit: 1000, type: 'PartTime', type1: 'Consultant', type2: 'Individual', type3: 'NotApplicable' },
      { name: `Consult B ${unique}`.slice(0, 20), email: `consult-b-${unique}@example.com`, mobile: '1010101010', country: 'India', address: '707 Advisor Ave', expense_limit: 2000, type: 'FullTime', type1: 'Consultant', type2: 'Individual', type3: 'NotApplicable' },
    ];
    createdIds.consultants = [];
    for (const p of payloads) {
      const res = await req('POST', '/api/consultant', p);
      if (!res.ok) throw new Error(`Create consultant failed: ${res.status} ${JSON.stringify(res.data)}`);
      const id = res.data?.id || res.data?.consultant_id;
      if (id) createdIds.consultants.push(id);
    }
    expect(createdIds.consultants.length).toBeGreaterThan(0);
  }, 15000);

  test('Create projects (Client→Company, Company→Vendor)', async () => {
    if (!createdIds.clients?.[0] || !createdIds.companies?.[0] || !createdIds.companies?.[1] || !createdIds.vendors?.[0]) {
      console.warn('Skipping projects: need clients, companies, vendors');
      return;
    }
    const projectPayloads = [
      { name: `Project Client→Company ${unique}`, description: 'Dummy project from client to company', given_by: createdIds.clients[0], taken_by: createdIds.companies[0], start_date: '2025-01-01', end_date: '2025-12-31', rate_mode: 'Monthly', rate_amount: '5000', currency: 'USD', type: 'ClientToCompany' },
      { name: `Project Company→Vendor ${unique}`, description: 'Dummy project from company to vendor', given_by: createdIds.companies[0], taken_by: createdIds.vendors[0], start_date: '2025-02-01', end_date: '2025-11-30', rate_mode: 'Fixed', rate_amount: '10000', currency: 'USD', type: 'CompanyToVendor' },
    ];
    createdIds.projects = [];
    for (const p of projectPayloads) {
      const res = await req('POST', '/api/project', p);
      if (!res.ok) throw new Error(`Create project failed: ${res.status} ${JSON.stringify(res.data)}`);
      const id = res.data?.id || res.data?.project_id;
      if (id) createdIds.projects.push(id);
    }
    expect(createdIds.projects.length).toBeGreaterThan(0);
  }, 15000);

  test('Create contracts (Company→Developer, Vendor→Consultant)', async () => {
    if (!createdIds.companies?.[0] || !createdIds.developers?.[0] || !createdIds.vendors?.[0] || !createdIds.consultants?.[0]) {
      console.warn('Skipping contracts: need companies, developers, vendors, consultants');
      return;
    }
    const contractPayloads = [
      { name: `Contract Company→Developer ${unique}`, description: 'Dummy contract company to developer', given_by: createdIds.companies[0], taken_by: createdIds.developers[0], start_date: '2025-03-01', end_date: '2025-10-31', rate_mode: 'Hourly', rate_amount: '50', currency: 'USD', type: 'CompanyToDeveloper' },
      { name: `Contract Vendor→Consultant ${unique}`, description: 'Dummy contract vendor to consultant', given_by: createdIds.vendors[0], taken_by: createdIds.consultants[0], start_date: '2025-04-01', end_date: '2025-09-30', rate_mode: 'Daily', rate_amount: '200', currency: 'EUR', type: 'VendorToDeveloper' },
    ];
    createdIds.contracts = [];
    for (const p of contractPayloads) {
      const res = await req('POST', '/api/project', p);
      if (!res.ok) throw new Error(`Create contract failed: ${res.status} ${JSON.stringify(res.data)}`);
      const id = res.data?.id || res.data?.project_id;
      if (id) createdIds.contracts.push(id);
    }
    expect(createdIds.contracts.length).toBeGreaterThan(0);
  }, 15000);

  test('Verify data was populated', async () => {
    const res = await req('GET', '/api/clients');
    expect(res.status).toBe(200);
    const clients = Array.isArray(res.data) ? res.data : Object.values(res.data || {});
    const ours = clients.filter((c) => c.name?.includes(unique));
    expect(ours.length).toBeGreaterThan(0);
  });
});
