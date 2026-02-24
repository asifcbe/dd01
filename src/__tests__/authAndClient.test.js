/**
 * Jest tests: Sign up → Sign in → then for each entity (Client, Company, Bank,
 * Consultant, Developer, Vendor): Create → Edit → Clone → Delete.
 * Uses the same credentials for the full flow and calls the real API.
 *
 * Set API_BASE or run against default (Render). Backend must allow signup/signin.
 *   API_BASE=https://invoice-generator-bq6g.onrender.com/invoice-generator npm test
 *
 * @jest-environment node
 */

const axios = require('axios');

const API_BASE = (process.env.API_BASE || process.env.INTEGRATION_API_BASE || 'https://invoice-generator-bq6g.onrender.com/invoice-generator').replace(/\/$/, '');

const unique = `jest-${Date.now()}`;
const org = `Org ${unique}`;
const email = `test-${unique}@example.com`;
const password = 'TestPassword123!';

let authCookie = null;

// Client
let createdClientId = null;
let createdClientName = null;
let clonedClientId = null;

// Company
let createdCompanyId = null;
let createdCompanyName = null;
let clonedCompanyId = null;

// Bank
let createdBankId = null;
let createdBankName = null;
let clonedBankId = null;

// Consultant
let createdConsultantId = null;
let createdConsultantName = null;
let clonedConsultantId = null;

// Developer
let createdDeveloperId = null;
let createdDeveloperName = null;
let clonedDeveloperId = null;

// Vendor
let createdVendorId = null;
let createdVendorName = null;
let clonedVendorId = null;

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

describe('Auth and participants flow (Client, Company, Bank, Consultant, Developer, Vendor)', () => {
  test('Sign up', async () => {
    const res = await request('POST', '/api/signup', {
      org: org.trim(),
      email: email.trim(),
      password,
    }, { useAuth: false });
    console.log({
      org: org.trim(),
      email: email.trim(),
      password,
    })
    expect([201, 200]).toContain(res.status);
  }, 15000);

  test('Sign in and capture session', async () => {
    const res = await request('POST', '/api/signin', {
      org: org.trim(),
      email: email.trim(),
      password,
    }, { useAuth: false });
    expect(res.status).toBe(200);
    expect(authCookie).toBeTruthy();
  }, 15000);

  test('Create client', async () => {
    const name = `Client ${unique}`;
    const payload = {
      name,
      email: `client-${unique}@example.com`,
      mobile:String(Math.random()).slice(2,12),
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
      mobile:String(Math.random()).slice(2,12),
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
      mobile:String(Math.random()).slice(2,12),
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

  test('Delete cloned client', async () => {
    expect(clonedClientId).toBeTruthy();
    const res = await request('DELETE', `/api/client?client_id=${clonedClientId}`);
    expect(res.ok).toBe(true);
  }, 15000);

  // —— Company ——
  test('Create company', async () => {
    const name = `Company ${unique}`;
    const payload = {
      name,
      email: `company-${unique}@example.com`,
      mobile:String(Math.random()).slice(2,12),
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
      mobile:String(Math.random()).slice(2,12),
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
      mobile:String(Math.random()).slice(2,12),
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

  test('Delete cloned company', async () => {
    expect(clonedCompanyId).toBeTruthy();
    const res = await request('DELETE', `/api/company?company_id=${clonedCompanyId}`);
    expect(res.ok).toBe(true);
  }, 15000);

  // —— Bank ——
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

  test('Delete cloned bank', async () => {
    expect(clonedBankId).toBeTruthy();
    const res = await request('DELETE', `/api/bank?bank_id=${clonedBankId}`);
    expect(res.ok).toBe(true);
  }, 15000);

  // —— Consultant ——
  test('Create consultant', async () => {
    const name = `Consultant ${unique}`.slice(0, 10);
    const payload = {
      name,
      email: `consultant-${unique}@example.com`,
      mobile:String(Math.random()).slice(2,12),
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
      mobile:String(Math.random()).slice(2,12),
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
      mobile:String(Math.random()).slice(2,12),
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

  test('Delete cloned consultant', async () => {
    expect(clonedConsultantId).toBeTruthy();
    const res = await request('DELETE', `/api/consultant?consultant_id=${clonedConsultantId}`);
    expect(res.ok).toBe(true);
  }, 15000);

  // —— Developer ——
  test('Create developer', async () => {
    const name = `Developer ${unique}`.slice(0, 10);
    const payload = {
      name,
      email: `developer-${unique}@example.com`,
      mobile:String(Math.random()).slice(2,12),
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
      mobile:String(Math.random()).slice(2,12),
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
      mobile:String(Math.random()).slice(2,12),
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

  test('Delete cloned developer', async () => {
    expect(clonedDeveloperId).toBeTruthy();
    const res = await request('DELETE', `/api/developer?developer_id=${clonedDeveloperId}`);
    expect(res.ok).toBe(true);
  }, 15000);

  // —— Vendor ——
  test('Create vendor', async () => {
    const name = `Vendor ${unique}`;
    const payload = {
      name,
      email: `vendor-${unique}@example.com`,
      mobile:String(Math.random()).slice(2,12),
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
      mobile:String(Math.random()).slice(2,12),
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
      mobile:String(Math.random()).slice(2,12),
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

  test('Delete cloned vendor', async () => {
    expect(clonedVendorId).toBeTruthy();
    const res = await request('DELETE', `/api/vendor?vendor_id=${clonedVendorId}`);
    expect(res.ok).toBe(true);
  }, 15000);

  //Load data for each entity
  test('Load clients', async () => {
    const res = await request('GET', '/api/clients');
    expect(res.status).toBe(200);
    
  });
  test('Load companies', async () => {
    const res = await request('GET', '/api/companies');
    expect(res.status).toBe(200);
    
  });
  test('Load banks', async () => {
    const res = await request('GET', '/api/banks');
    expect(res.status).toBe(200);
    
  });
  test('Load vendors', async () => {
    const res = await request('GET', '/api/vendors');
    expect(res.status).toBe(200);
    
  });
  test('Load consultants', async () => {
    const res = await request('GET', '/api/consultants');
    expect(res.status).toBe(200);
    
  });
  test('Load developers', async () => {
    const res = await request('GET', '/api/developers');
    expect(res.status).toBe(200);
    
  });
  test('Load contracts', async () => {
    const res = await request('GET', '/api/projects?type=CompanyToDeveloper');
    expect(res.status).toBe(200);
    

  });
  test('Load projects', async () => {
    const res = await request('GET', '/api/projects?type=CompanyToDeveloper');
    expect(res.status).toBe(200);
    
  });
  // test('Load templates', async () => {
  //   const res = await request('GET', '/api/templates');
  //   expect(res.status).toBe(200);
    
  // });
  // test('Load invoices', async () => {
  //   const res = await request('GET', '/api/invoices');
  //   expect(res.status).toBe(200);
    
  // });
  // —— Fetch counts ——
  test('Fetch clients count', async () => {
    const res = await request('GET', '/api/clients/count');
    expect(res.status).toBe(200);
    
  });
  test('Fetch companies count', async () => {
    const res = await request('GET','/api/companies/count');
    expect(res.status).toBe(200);
    
  });
  test('Fetch banks count', async () => {
    const res = await request('GET','/api/banks/count');
    expect(res.status).toBe(200);
    
  });
  test('Fetch vendors count', async () => {
    const res = await request('GET','/api/vendors/count');
    expect(res.status).toBe(200);
    
  });
  test('Fetch consultants count', async () => {
    const res = await request('GET','/api/consultants/count');
    expect(res.status).toBe(200);
    
  });
  test('Fetch developers count', async () => {
    const res = await request('GET','/api/developers/count');
    expect(res.status).toBe(200);
    
  });
  test('Fetch contracts count', async () => {
    const res = await request('GET','/api/contracts/count');
    expect(res.status).toBe(200);
    
  });
  test('Fetch projects count', async () => {
    const res = await request('GET','/api/projects/count');
    expect(res.status).toBe(200);
    
  });
  test('Fetch templates count', async () => {
    const res = await request('GET','/api/templates/count');
    expect(res.status).toBe(200);
    
  });
  test('Fetch invoices count', async () => {
    const res = await request('GET','/api/invoices/count');
    expect(res.status).toBe(200);
    
  });
});
