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
} from "@mui/material";

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

  // Example templates - name + content HTML/text
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Simple Template",
      content:
        "<h1>Simple Invoice</h1><p>Thank you for your business.</p>",
    },
    {
      id: 2,
      name: "Detailed Template",
      content:
        "<h1>Detailed Invoice</h1><p>Items, pricing details...</p>",
    },
  ]);

  // Selected template id
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);

  // New Template form state
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");

  // Invoices data
  const [invoices, setInvoices] = useState([]);

  // Snackbar notification
  const [notification, setNotification] = useState(null);

  const handleChangeTab = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleTemplateChange = (event) => {
    setSelectedTemplateId(event.target.value);
  };

  const handleAddNewTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) {
      setNotification({ severity: "error", message: "Please fill template name and content" });
      return;
    }
    const newId = templates.length ? Math.max(...templates.map(t => t.id)) + 1 : 1;
    const newTemplate = {
      id: newId,
      name: newTemplateName.trim(),
      content: newTemplateContent.trim(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
    setNewTemplateName("");
    setNewTemplateContent("");
    setNotification({ severity: "success", message: "Template saved!" });
  };

  const handleCreateInvoice = () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) {
      setNotification({ severity: "error", message: "Select a valid template" });
      return;
    }
    const newInvoice = {
      id: invoices.length ? Math.max(...invoices.map(i => i.id)) + 1 : 1,
      templateName: template.name,
      content: template.content,
      createdAt: new Date(),
    };
    setInvoices((prev) => [...prev, newInvoice]);
    setNotification({ severity: "success", message: "Invoice created!" });
  };

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
              <Box key={invoice.id}>
                <ListItem>
                  <ListItemText
                    primary={`Invoice #${invoice.id} - ${invoice.templateName}`}
                    secondary={invoice.createdAt.toLocaleString()}
                  />
                </ListItem>
                <Divider />
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
            label="Template Content (HTML)"
            value={newTemplateContent}
            onChange={(e) => setNewTemplateContent(e.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={4}
          />
          <Button variant="outlined" onClick={handleAddNewTemplate}>
            Save Template
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
          <Alert onClose={() => setNotification(null)} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}
