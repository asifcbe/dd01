import React, { useState, useEffect } from "react";
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
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

import InvoiceTemplate from "./InvoiceTemplate"; // your CSS-based invoice component

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Invoices() {
  const [tabIndex, setTabIndex] = useState(0);
  const [templates, setTemplates] = useState({});
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setLoadingTemplates(true);
    fetch("api/templates", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        setLoadingTemplates(false);
      })
      .catch(() => {
        setNotification({ severity: "error", message: "Failed to load templates" });
        setLoadingTemplates(false);
      });
  }, []);

  const templateArray = Object.values(templates);

  const fetchInvoiceData = (template_id) => {
    setLoadingInvoice(true);
    fetch(`api/invoice/print-view?template_id=${template_id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setInvoiceData(data);
        setLoadingInvoice(false);
      })
      .catch(() => {
        setNotification({ severity: "error", message: "Failed to load invoice" });
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
      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} aria-label="Invoice tabs">
        <Tab label="Templates" id="invoice-tab-0" aria-controls="invoice-tabpanel-0" />
        <Tab label="Invoice" id="invoice-tab-1" aria-controls="invoice-tabpanel-1" />
      </Tabs>

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
                {templateArray.map((tpl) => (
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
          <InvoiceTemplate {...extractInvoiceViewData(invoiceData)} />
        ) : (
          <Typography>
            Please select a template and click 'View Invoice' to see invoice.
          </Typography>
        )}
      </TabPanel>

      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {notification && (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}
