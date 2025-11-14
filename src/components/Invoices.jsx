import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  Stack,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`invoice-tabpanel-${index}`}
      aria-labelledby={`invoice-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Invoices() {
  // Tab 0 = List, Tab 1 = Generate
  const [tabIndex, setTabIndex] = useState(0);

  // Templates saved by user
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Simple Template",
      header: "Simple Invoice",
    },
    {
      id: 2,
      name: "Detailed Template",
      header: "Detailed Invoice",
    },
  ]);

  // Invoice list
  const [invoices, setInvoices] = useState([]);

  // Selected template for new invoice
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);

  // New template form state
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateHeader, setNewTemplateHeader] = useState("");

  // New invoice line items
  const [invoiceItems, setInvoiceItems] = useState([
    { description: "", quantity: "", price: "" },
  ]);

  // Snackbar notification
  const [notification, setNotification] = useState(null);

  const handleChangeTab = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleTemplateChange = (event) => {
    setSelectedTemplateId(event.target.value);
  };

  const handleAddNewTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateHeader.trim()) {
      setNotification({
        severity: "error",
        message: "Please fill template name and header",
      });
      return;
    }
    const newId = templates.length
      ? Math.max(...templates.map((t) => t.id)) + 1
      : 1;
    const newTemplate = {
      id: newId,
      name: newTemplateName.trim(),
      header: newTemplateHeader.trim(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
    setNewTemplateName("");
    setNewTemplateHeader("");
    setNotification({ severity: "success", message: "Template saved!" });
  };

  const handleInvoiceItemChange = (index, field, value) => {
    const newItems = [...invoiceItems];
    newItems[index][field] = value;
    setInvoiceItems(newItems);
  };

  const handleAddInvoiceItem = () => {
    setInvoiceItems((prev) => [...prev, { description: "", quantity: "", price: "" }]);
  };

  const handleRemoveInvoiceItem = (index) => {
    const newItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newItems);
  };

  const handleCreateInvoice = () => {
    // Validate input
    if (!invoiceItems.length || invoiceItems.some(item => !item.description || !item.quantity || !item.price)) {
      setNotification({ severity: "error", message: "Fill all invoice item fields." });
      return;
    }

    const template = templates.find((t) => t.id === selectedTemplateId);
    if (!template) {
      setNotification({ severity: "error", message: "Select a valid template" });
      return;
    }

    const newInvoice = {
      id: invoices.length ? Math.max(...invoices.map((i) => i.id)) + 1 : 1,
      templateName: template.name,
      header: template.header,
      items: invoiceItems.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.quantity) * Number(item.price)
      })),
      createdAt: new Date(),
    };
    setInvoices((prev) => [...prev, newInvoice]);
    setNotification({ severity: "success", message: "Invoice created!" });
    setInvoiceItems([{ description: "", quantity: "", price: "" }]);
  };

  // Calculate invoice total
  const calcTotal = (items) => items.reduce((acc, item) => acc + item.total, 0);

  return (
    <Box>
      <Tabs value={tabIndex} onChange={handleChangeTab} aria-label="Invoice tabs">
        <Tab label="List Invoices" id="invoice-tab-0" aria-controls="invoice-tabpanel-0" />
        <Tab label="Generate Invoice" id="invoice-tab-1" aria-controls="invoice-tabpanel-1" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        {invoices.length === 0 ? (
          <Typography>No invoices created yet.</Typography>
        ) : (
          <List component={Paper}>
            {invoices.map((invoice) => (
              <Box key={invoice.id} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>{invoice.header}</Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Invoice #{invoice.id} - Template: {invoice.templateName}
                </Typography>
                <Typography variant="caption" gutterBottom>
                  Created: {invoice.createdAt.toLocaleString()}
                </Typography>

                <Table size="small" sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: "bold" }}>Grand Total</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>{calcTotal(invoice.items).toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </List>
        )}
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel id="template-select-label">Select Template</InputLabel>
            <Select
              labelId="template-select-label"
              value={selectedTemplateId}
              label="Select Template"
              onChange={handleTemplateChange}
            >
              {templates.map(({ id, name }) => (
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h6">Create and Save a New Template</Typography>

          <TextField
            label="Template Name"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Template Header"
            value={newTemplateHeader}
            onChange={(e) => setNewTemplateHeader(e.target.value)}
            fullWidth
            size="small"
            multiline
          />
          <Button variant="outlined" onClick={handleAddNewTemplate}>
            Save Template
          </Button>

          <Divider />

          <Typography variant="h6">Invoice Items</Typography>

          {invoiceItems.map((item, idx) => (
            <Stack
              key={idx}
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <TextField
                label="Description"
                value={item.description}
                onChange={(e) => handleInvoiceItemChange(idx, "description", e.target.value)}
                size="small"
                sx={{ flexGrow: 2 }}
              />
              <TextField
                label="Quantity"
                type="number"
                value={item.quantity}
                onChange={(e) => handleInvoiceItemChange(idx, "quantity", e.target.value)}
                size="small"
                sx={{ maxWidth: 100 }}
              />
              <TextField
                label="Price"
                type="number"
                value={item.price}
                onChange={(e) => handleInvoiceItemChange(idx, "price", e.target.value)}
                size="small"
                sx={{ maxWidth: 120 }}
              />
              <IconButton onClick={() => handleRemoveInvoiceItem(idx)} color="error">
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}

          <Button variant="text" startIcon={<AddIcon />} onClick={handleAddInvoiceItem}>
            Add Item
          </Button>

          <Divider />

          <Button variant="contained" onClick={handleCreateInvoice}>
            Create Invoice with Selected Template
          </Button>
        </Stack>
      </TabPanel>

      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {notification && (
          <Alert onClose={() => setNotification(null)} severity={notification.severity} sx={{ width: "100%" }}>
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}
