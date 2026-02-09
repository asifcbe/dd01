import React, { useState, useEffect, lazy, Suspense } from "react";
import { handleApiError } from "./utils";
import { useThemeContext } from "../context/ThemeContext";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useToast } from "../context/ToastContext";
import { useSearch } from "../context/SearchContext";

const InvoiceTemplate = lazy(() => import("./InvoiceTemplate")); // lazy-load heavy template

// Helper to flatten nested invoice items with thru chain
function flattenInvoiceItems(invoiceItems) {
  const rows = [];
  function walk(itemArr, thru = []) {
    itemArr.forEach((item) => {
      const newThru = [...thru];
      if (item.given_to && item.given_to.length) {
        newThru.push(item.name + ", " + item.address);
        walk(item.given_to, newThru);
      } else {
        rows.push({
          id: item.id,
          name: item.name,
          location: item.address,
          thru: newThru.reverse(),
          rateMode: item.project?.rate_mode || "",
          duration: 0,
          rateAmount: item.project?.rate_amount || 0,
          currency: item.project?.currency || "",
          total: 0,
        });
      }
    });
  }
  invoiceItems.forEach((itemGroup) => walk(itemGroup));
  return rows;
}

// Extract invoice view data dynamically from API response
function extractInvoiceViewData(data) {
  const from = {
    name: data.company?.name || "",
    mobile: data.company?.mobile || "",
    email: data.company?.email || "",
    address: data.company?.address || "",
  };
  const to = {
    name: data.client?.name || "",
    mobile: data.client?.mobile || "",
    email: data.client?.email || "",
    address: data.client?.address || "",
  };

  // Calculate subtotal, tax, total dynamically if possible
  let subtotal = 0;
  flattenInvoiceItems(data.invoice_items || []).forEach(item => {
    subtotal += Number(item.rateAmount) || 0;
  });
  const tax = subtotal * 0.1;  // assuming 10% tax
  const total = subtotal + tax;

  return {
    invoiceId: `INV-${data.template_id || 1}`,
    from,
    to,
    invoiceDate: data.invoice_date || "",
    dueDate: data.due_date || "",
    items: flattenInvoiceItems(data.invoice_items || []),
    subtotal: subtotal.toLocaleString(),
    tax: tax.toLocaleString(),
    total: total.toLocaleString(),
    notice: data.notice || "A finance charge of 1.5% will be made on unpaid balances after 30 days.",
  };
}

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index} aria-labelledby={`tab-${index}`}>
      {value === index && <Box sx={{ p: 3,pl:0,pr:0 }}>{children}</Box>}
    </div>
  );
}

export default function Invoices() {
  const { showError } = useToast();
  const { searchValue: search } = useSearch();
  const [tabIndex, setTabIndex] = useState(0);
  const { currentThemeName } = useThemeContext();
  const borderColor = {
    light: "black",
    dark: "white",
    navy: "rgb(0, 188, 212)"
  };
  const [templates, setTemplates] = useState({});
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingTemplates(true);
    fetch("api/templates", { credentials: "include" })
      .then((res) => handleApiError(res, "Failed to fetch templates"))
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        setLoadingTemplates(false);
      })
      .catch((error) => {
        showError(error.message,error);
        setLoadingTemplates(false);
      });
  }, []);

  const templateArray = Object.values(templates);

  const fetchInvoiceData = (template_id) => {
    setLoadingInvoice(true);
    fetch(`api/invoice/print-view?template_id=${template_id}&hirearchy=true`, { credentials: "include" })
      .then((res) => handleApiError(res, "Failed to fetch invoice"))
      .then((res) => res.json())
      .then((data) => {
        setInvoiceData(data);
        setLoadingInvoice(false);
      })
      .catch((error) => {
        showError(error.message,error);
        setLoadingInvoice(false);
      });
  };

  const handleInvoiceButtonClick = (template) => {
    setSelectedTemplate(template);
    setTabIndex(1);
    fetchInvoiceData(template.id);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        
        <Tabs 
        value={tabIndex} 
        onChange={(_, v) => setTabIndex(v)}
        sx={{
          minHeight: '52px',
          mb: 0,
          '& .MuiTabs-indicator': {
            display: 'none',
          },
          '& .MuiTabs-flexContainer': {
            gap: '8px',
          },
        }}
      >
        <Tab 
          label="Templates" 
          id="invoice-tab-0" 
          aria-controls="invoice-tabpanel-0"
          sx={{
            position: 'relative',
            minHeight: '52px',
            minWidth: '140px',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
            letterSpacing: '0.3px',
            color: tabIndex === 0 ? '#ffffff !important' : 'text.secondary',
            bgcolor: tabIndex === 0 ? 'primary.main' : 'background.default',
            border: tabIndex === 0 ? 'none' : `1px solid ${borderColor[currentThemeName]}`,
            borderRadius: 0,
            px: 4,
            py: 1.5,
            clipPath: tabIndex === 0 
              ? 'polygon(0% 0%, 85% 0%, 100% 100%, 0% 100%)'
              : 'polygon(0% 0%, calc(85% - 1px) 0%, calc(100% - 1px) 100%, 0% 100%)',
            boxShadow: tabIndex === 0 ? '0 4px 12px rgba(0, 163, 255, 0.3)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: tabIndex === 0 ? 2 : 1,
            '&::before': tabIndex !== 0 ? {
              content: '""',
              position: 'absolute',
              top: '-2px',
              right: '0',
              bottom: '-2px',
              width: '16%',
              background: borderColor[currentThemeName],
              clipPath: 'polygon(100% 0%, 0% 0%, 100% 100%)',
              zIndex: 2,
            } : {},
            '&:hover': {
              bgcolor: tabIndex === 0 ? 'primary.main' : 'action.hover',
              boxShadow: tabIndex === 0 
                ? '0 6px 16px rgba(0, 163, 255, 0.4)' 
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '& .MuiTab-wrapper': {
              color: tabIndex === 0 ? '#ffffff !important' : 'inherit',
            },
          }}
        />
        <Tab 
          label="Invoice" 
          id="invoice-tab-1" 
          aria-controls="invoice-tabpanel-1"
          sx={{
            position: 'relative',
            minHeight: '52px',
            minWidth: '140px',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
            letterSpacing: '0.3px',
            color: tabIndex === 1 ? '#ffffff !important' : 'text.secondary',
            bgcolor: tabIndex === 1 ? 'primary.main' : 'background.default',
            border: tabIndex === 1 ? 'none' : `1px solid ${borderColor[currentThemeName]}`,
            borderRadius: 0,
            px: 4,
            py: 1.5,
            clipPath: tabIndex === 1 
              ? 'polygon(0% 0%, 85% 0%, 100% 100%, 0% 100%)'
              : 'polygon(0% 0%, calc(85% - 1px) 0%, calc(100% - 1px) 100%, 0% 100%)',
            boxShadow: tabIndex === 1 ? '0 4px 12px rgba(0, 163, 255, 0.3)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: tabIndex === 1 ? 2 : 1,
            '&::before': tabIndex !== 1 ? {
              content: '""',
              position: 'absolute',
              top: '-2px',
              right: '0',
              bottom: '-2px',
              width: '16%',
              background: borderColor[currentThemeName],
              clipPath: 'polygon(100% 0%, 0% 0%, 100% 100%)',
              zIndex: 2,
            } : {},
            '&:hover': {
              bgcolor: tabIndex === 1 ? 'primary.main' : 'action.hover',
              boxShadow: tabIndex === 1 
                ? '0 6px 16px rgba(0, 163, 255, 0.4)' 
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '& .MuiTab-wrapper': {
              color: tabIndex === 1 ? '#ffffff !important' : 'inherit',
            },
          }}
        />
      </Tabs>
      </Box>

      <TabPanel value={tabIndex} index={0}>
        {loadingTemplates ? (
          <CircularProgress />
        ) : templateArray.length === 0 ? (
          <Typography>No templates found.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templateArray
                  .filter(tpl => tpl.name.toLowerCase().includes(search.toLowerCase()) || (tpl.description && tpl.description.toLowerCase().includes(search.toLowerCase())))
                  .map((tpl) => (
                  <TableRow key={tpl.id}>
                    <TableCell>{tpl.name}</TableCell>
                    <TableCell>{tpl.description || "No description"}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        onClick={() => handleInvoiceButtonClick(tpl)}
                      >
                        View Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        {loadingInvoice ? (
          <CircularProgress />
        ) : invoiceData ? (
          <Suspense fallback={<div>Loading invoice template...</div>}>
            <InvoiceTemplate template={selectedTemplate} invoiceData={invoiceData} />
          </Suspense>
        ) : (
          <Typography>
            Please select a template and click 'View Invoice' to see invoice.
          </Typography>
        )}
      </TabPanel>
    </Box>
  );
}
