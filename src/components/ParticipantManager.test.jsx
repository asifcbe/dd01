/**
 * ParticipantManager tests: Add (POST), Edit (PATCH), Delete (DELETE), Clone.
 *
 * Run all tests:
 *   npm run test:run
 *
 * Run only this file:
 *   npm run test:run -- src/components/ParticipantManager.test.jsx
 *
 * Run in watch mode (re-run on file changes):
 *   npm test -- src/components/ParticipantManager.test.jsx
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ParticipantManager from './ParticipantManager';
import { Groups as ClientsIcon } from '@mui/icons-material';

// Mock contexts
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));
vi.mock('../context/SearchContext', () => ({
  useSearch: () => ({ searchValue: '' }),
}));
vi.mock('../context/ErrorContext', () => ({
  useErrorScreen: () => ({ showErrorOnScreen: vi.fn() }),
}));
vi.mock('./LoadMask', () => ({ default: () => null }));

const theme = createTheme();

/** Entity configs matching Clients, Companies, Consultants, Developer, Banks, Vendors */
const entityConfigs = [
  {
    name: 'Client',
    title: 'Clients',
    icon: ClientsIcon,
    apiType: 'Client',
    apiDetailType: 'clients',
    apiDetailTypeSingle: 'client',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'type', label: 'Type', type: 'select', options: ['Individual', 'Company'] },
      { name: 'mobile', label: 'Mobile', type: 'text' },
      { name: 'address', label: 'Address', type: 'text' },
    ],
    initialForm: { name: '', email: '', mobile: '', address: '', type: 'Individual' },
    type2: (item) => item.type,
    type3: 'NotApplicable',
  },
  {
    name: 'Company',
    title: 'Companies',
    icon: ClientsIcon,
    apiType: 'Company',
    apiDetailType: 'companies',
    apiDetailTypeSingle: 'company',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'mobile', label: 'Mobile', type: 'text' },
      { name: 'address', label: 'Address', type: 'text' },
    ],
    initialForm: { name: '', email: '', mobile: '', address: '' },
    type2: () => 'Company',
  },
  {
    name: 'Consultant',
    title: 'Consultants',
    icon: ClientsIcon,
    apiType: 'Consultant',
    apiDetailType: 'consultants',
    apiDetailTypeSingle: 'consultant',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'mobile', label: 'Mobile', type: 'text' },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'type', label: 'Type', type: 'select', options: ['PartTime', 'FullTime'] },
    ],
    initialForm: { name: '', email: '', mobile: '', address: '', type: 'PartTime' },
    type2: () => 'Individual',
  },
  {
    name: 'Developer',
    title: 'Developer',
    icon: ClientsIcon,
    apiType: 'Developer',
    apiDetailType: 'developers',
    apiDetailTypeSingle: 'developer',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'mobile', label: 'Mobile', type: 'text' },
      { name: 'address', label: 'Address', type: 'text' },
    ],
    initialForm: { name: '', email: '', mobile: '', address: '' },
    type2: undefined,
  },
  {
    name: 'Bank',
    title: 'Banks',
    icon: ClientsIcon,
    apiType: 'Bank',
    apiDetailType: 'banks',
    apiDetailTypeSingle: 'bank',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'code', label: 'Code', type: 'text' },
      { name: 'branch', label: 'Branch', type: 'text' },
    ],
    initialForm: { name: '', code: '', branch: '' },
    type2: () => 'Bank',
  },
  {
    name: 'Vendor',
    title: 'Vendors',
    icon: ClientsIcon,
    apiType: 'Vendor',
    apiDetailType: 'vendors',
    apiDetailTypeSingle: 'vendor',
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'mobile', label: 'Mobile', type: 'text' },
      { name: 'address', label: 'Address', type: 'text' },
    ],
    initialForm: { name: '', email: '', mobile: '', address: '' },
    type2: () => 'Company',
  },
];

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('ParticipantManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Add (POST)', () => {
    entityConfigs.forEach((config) => {
      it(`${config.name}: calls POST /api/${config.apiDetailTypeSingle} with correct body when adding`, async () => {
        global.fetch
          .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // GET list
          .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 1 }) }) // POST add
          .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // GET list after add

        renderWithTheme(
          <ParticipantManager
            title={config.title}
            icon={config.icon}
            apiType={config.apiType}
            apiDetailType={config.apiDetailType}
            apiDetailTypeSingle={config.apiDetailTypeSingle}
            fields={config.fields}
            displayFields={config.fields.slice(0, 2)}
            initialForm={config.initialForm}
            type2={config.type2}
            type3={config.type3 ?? 'NotApplicable'}
          />
        );

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            `/api/${config.apiDetailType}`,
            expect.objectContaining({ method: 'GET' })
          );
        });

        await userEvent.click(screen.getByRole('button', { name: new RegExp(`Add ${config.apiType}`, 'i') }));
        await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

        const dialog = screen.getByRole('dialog');
        const nameInput = within(dialog).queryByLabelText(/name/i);
        if (nameInput) {
          await userEvent.type(nameInput, 'Test Name');
        }

        const addBtn = within(dialog).getByRole('button', { name: /^add$/i });
        await userEvent.click(addBtn);

        await waitFor(() => {
          const postCalls = global.fetch.mock.calls.filter((c) => c[1]?.method === 'POST');
          expect(postCalls.length).toBeGreaterThanOrEqual(1);
          const [url, opts] = postCalls[postCalls.length - 1];
          expect(url).toBe(`/api/${config.apiDetailTypeSingle}`);
          expect(opts.method).toBe('POST');
          expect(opts.headers['Content-Type']).toBe('application/json');
          const body = JSON.parse(opts.body);
          expect(body.type1).toBe(config.apiType);
          if (config.type2) {
            expect(body.type2).toBeDefined();
          }
        });
      });
    });
  });

  describe('Update (PATCH)', () => {
    entityConfigs.forEach((config) => {
      it(`${config.name}: calls PATCH /api/${config.apiDetailTypeSingle}?${config.apiDetailTypeSingle}_id= when updating`, async () => {
        const typeByEntity = {
          Client: 'Individual',
          Consultant: 'PartTime',
          Company: undefined,
          Developer: undefined,
          Bank: undefined,
          Vendor: undefined,
        };
        const type2ByEntity = {
          Client: 'Individual',
          Consultant: 'PartTime',
          Company: 'Company',
          Developer: undefined,
          Bank: 'Bank',
          Vendor: 'Company',
        };
        const mockItem = {
          id: 42,
          name: 'Existing',
          email: 'e@test.com',
          mobile: '1234567890',
          address: '',
          type2: type2ByEntity[config.apiType],
          type: typeByEntity[config.apiType] || 'Individual',
        };
        if (config.apiType === 'Bank') {
          mockItem.code = 'CODE';
          mockItem.branch = 'Branch';
        }

        global.fetch
          .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([mockItem]) }) // GET list
          .mockResolvedValueOnce({ ok: true }) // PATCH update
          .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // GET list after update

        renderWithTheme(
          <ParticipantManager
            title={config.title}
            icon={config.icon}
            apiType={config.apiType}
            apiDetailType={config.apiDetailType}
            apiDetailTypeSingle={config.apiDetailTypeSingle}
            fields={config.fields}
            displayFields={config.fields.slice(0, 2)}
            initialForm={config.initialForm}
            type2={config.type2}
            type3={config.type3 ?? 'NotApplicable'}
          />
        );

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            `/api/${config.apiDetailType}`,
            expect.any(Object)
          );
        });

        const buttons = screen.getAllByRole('button');
        const moreButton = buttons.find((b) => !b.textContent.match(/Add|Cancel|Save/) && b.querySelector('svg'));
        expect(moreButton).toBeTruthy();
        await userEvent.click(moreButton);

        const editMenuItem = await screen.findByRole('menuitem', { name: /edit/i });
        await userEvent.click(editMenuItem);

        await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

        const dialog = screen.getByRole('dialog');
        const saveBtn = within(dialog).getByRole('button', { name: /save/i });
        await userEvent.click(saveBtn);

        await waitFor(() => {
          const patchCalls = global.fetch.mock.calls.filter((c) => c[1]?.method === 'PATCH');
          expect(patchCalls.length).toBeGreaterThanOrEqual(1);
          const [url] = patchCalls[patchCalls.length - 1];
          expect(url).toContain(`/api/${config.apiDetailTypeSingle}`);
          expect(url).toContain(`${config.apiDetailTypeSingle}_id=42`);
        });
      });
    });
  });

  describe('Delete (DELETE)', () => {
    entityConfigs.forEach((config) => {
      it(`${config.name}: calls DELETE /api/${config.apiDetailTypeSingle}?${config.apiDetailTypeSingle}_id= when deleting`, async () => {
        const mockItem = {
          id: 99,
          name: 'To Delete',
          email: 'del@test.com',
          mobile: '9999999999',
          address: '',
          type2: 'Individual',
          type: 'Individual',
        };
        if (config.apiType === 'Bank') {
          mockItem.code = 'CODE';
          mockItem.branch = 'Branch';
        }

        global.fetch
          .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([mockItem]) }) // GET list
          .mockResolvedValueOnce({ ok: true }); // DELETE (no refetch in component for delete, only setState)

        renderWithTheme(
          <ParticipantManager
            title={config.title}
            icon={config.icon}
            apiType={config.apiType}
            apiDetailType={config.apiDetailType}
            apiDetailTypeSingle={config.apiDetailTypeSingle}
            fields={config.fields}
            displayFields={config.fields.slice(0, 2)}
            initialForm={config.initialForm}
            type2={config.type2}
            type3={config.type3 ?? 'NotApplicable'}
          />
        );

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            `/api/${config.apiDetailType}`,
            expect.any(Object)
          );
        });

        const buttons = screen.getAllByRole('button');
        const moreButton = buttons.find((b) => !b.textContent.match(/Add|Cancel|Save/) && b.querySelector('svg'));
        expect(moreButton).toBeTruthy();
        await userEvent.click(moreButton);

        const deleteMenuItem = await screen.findByRole('menuitem', { name: /delete/i });
        await userEvent.click(deleteMenuItem);

        await waitFor(() => {
          const deleteCalls = global.fetch.mock.calls.filter((c) => c[1]?.method === 'DELETE');
          expect(deleteCalls.length).toBeGreaterThanOrEqual(1);
          const [url] = deleteCalls[deleteCalls.length - 1];
          expect(url).toContain(`/api/${config.apiDetailTypeSingle}`);
          expect(url).toContain(`${config.apiDetailTypeSingle}_id=99`);
        });
      });
    });
  });

  describe('Clone', () => {
    entityConfigs.forEach((config) => {
      it(`${config.name}: opens Add dialog with cloned data (name with " (Copy)") when Clone is clicked`, async () => {
        const mockItem = {
          id: 10,
          name: 'Original Item',
          email: 'orig@test.com',
          mobile: '1111111111',
          address: 'Some address',
          type2: config.apiType === 'Client' ? 'Individual' : config.apiType === 'Company' ? 'Company' : config.apiType === 'Bank' ? 'Bank' : config.apiType === 'Vendor' ? 'Company' : undefined,
          type: config.apiType === 'Client' ? 'Individual' : config.apiType === 'Consultant' ? 'PartTime' : undefined,
        };
        if (config.apiType === 'Bank') {
          mockItem.code = 'BANK1';
          mockItem.branch = 'Main';
        }

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([mockItem]),
        });

        renderWithTheme(
          <ParticipantManager
            title={config.title}
            icon={config.icon}
            apiType={config.apiType}
            apiDetailType={config.apiDetailType}
            apiDetailTypeSingle={config.apiDetailTypeSingle}
            fields={config.fields}
            displayFields={config.fields.slice(0, 2)}
            initialForm={config.initialForm}
            type2={config.type2}
            type3={config.type3 ?? 'NotApplicable'}
          />
        );

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            `/api/${config.apiDetailType}`,
            expect.any(Object)
          );
        });

        const buttons = screen.getAllByRole('button');
        const moreButton = buttons.find((b) => !b.textContent.match(/Add|Cancel|Save/) && b.querySelector('svg'));
        expect(moreButton).toBeTruthy();
        await userEvent.click(moreButton);

        const cloneMenuItem = await screen.findByRole('menuitem', { name: /clone/i });
        await userEvent.click(cloneMenuItem);

        await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAccessibleName(new RegExp(`Add ${config.apiType}`, 'i'));
        const nameInput = within(dialog).queryByLabelText(/name/i);
        if (nameInput) {
          expect(nameInput).toHaveValue('Original Item (Copy)');
        }
      });
    });
  });
});
