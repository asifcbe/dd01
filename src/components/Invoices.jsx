import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Component to render raw invoice HTML with styles
const InvoiceRawHtml = ({ rawHtml }) => {
  const styles = `
.container {
  max-width: 950px;
  margin: 30px auto;
  font-family: "Segoe UI", "Roboto", Arial, sans-serif;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 18px rgba(0,0,0,0.07);
  padding: 32px 28px 18px 28px;
  color: #212a34;
}
.card {
  border: none;
  background: none;
  box-shadow: none;
}
.card-header,
.card-body {
  padding: 0;
}
.toolbar {
  text-align: right;
  margin-bottom: 12px;
}
.toolbar .btn {
  background: #8E39F8;
  color: #fff;
  border-radius: 6px;
  border: none;
  padding: 6px 16px;
  margin-left: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(108,72,195,0.10);
  transition: background 0.2s;
}
.toolbar .btn-danger { background: #dc3545; }
.toolbar .btn-dark { background: #232a34; }
.toolbar .btn:hover { background: #651bbf; }
.toolbar .btn-danger:hover { background: #a71d2a; }
.toolbar .btn-dark:hover { background: #101418; }
hr {
  margin: 16px 0 0 0;
  border: 0;
  border-top: 1px solid #e0e6ed;
}
header {
  border-bottom: 2px solid #e0e6ed;
  padding-bottom: 12px;
  margin-bottom: 18px;
}
header .row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
header .company-details h2 {
  font-size: 28px;
  color: #3283F5;
  margin: 0;
}
header .company-details {
  text-align: right;
}
.invoice-details h1 {
  font-size: 32px;
  color: #3283F5;
  font-weight: 700;
  margin-bottom: 6px;
}
.invoice-details > div { font-size: 15px; color: #212a34; }
.contacts {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  margin-bottom: 12px;
}
.contacts .invoice-to, .contacts .invoice-details {
  min-width: 220px;
}
.contacts .invoice-to .text-gray-light {
  font-size: 15px;
  color: #7a7f81;
  margin-bottom: 8px;
  font-weight: 500;
}
.contacts .invoice-to h2 {
  font-size: 24px;
  margin-bottom: 5px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 14px;
}
thead th {
  background: #f4f8fc;
  color: #383e4b;
  font-size: 16px;
  font-weight: 600;
  padding: 10px 0;
  border-bottom: 2px solid #e0e6ed;
  text-align: left;
}
tbody tr {
  background: #fafbfc;
}
tbody tr:nth-child(even) {
  background: #eaf4fe;
}
tbody td {
  padding: 11px 7px;
  font-size: 15px;
  vertical-align: top;
  border-bottom: 1px solid #eaeaea;
}
td.no, th.no {
  font-weight: bold;
  font-size: 18px;
  text-align: center;
  background: #3283F5;
  color: #fff;
  min-width: 44px;
  border-radius: 5px 0 0 5px;
}
td.total, th.total {
  background: #3283F5;
  color: #fff;
  font-weight: bold;
  text-align: right;
  min-width: 44px;
  border-radius: 0 5px 5px 0;
}
tfoot tr {
  background: transparent;
}
tfoot td {
  font-size: 16px;
  font-weight: 600;
  padding: 10px 7px;
  color: #212a34;
  border-top: 2px solid #e0e6ed;
}
tfoot tr:last-child td {
  color: #3283F5;
  font-size: 18px;
}
.thanks {
  font-weight: 700;
  font-size: 22px;
  margin: 30px 0 14px 0;
}
.notices {
  background: #eaf4fe;
  border-left: 5px solid #3283F5;
  padding: 12px 18px;
  color: #212a34;
  font-size: 15px;
  border-radius: 7px;
  margin-bottom: 22px;
  margin-top: 10px;
}
footer {
  margin-top: 35px;
  font-size: 14px;
  color: #8e8e8f;
  text-align: center;
  border-top: 1px solid #e0e6ed;
  padding-top: 9px;
}
a {
  color: #3283F5;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
`;


  return (
    <div>
      <style>{styles}</style>
      <div className="container" dangerouslySetInnerHTML={{ __html: rawHtml }} />
    </div>
  );
};

export default function Invoice() {
  const [tabIdx, setTabIdx] = useState(0);
  const [templateListObj, setTemplateListObj] = useState({});
  const [templateList, setTemplateList] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [invoiceHtml, setInvoiceHtml] = useState(null); // holds raw HTML string
  const [menuAnchors, setMenuAnchors] = useState({});
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetch("api/templates", { method: "GET", credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch templates");
        return res.json();
      })
      .then((data) => {
        setTemplateListObj(data);
        setTemplateList(Object.values(data));
      })
      .catch(() =>
        setNotification({ severity: "error", message: "Failed to load templates" })
      );
  }, []);

  useEffect(() => {
    if (!selectedTemplateId) return;

    setLoadingInvoice(true);
    let htmlString=`<div class="container p-0">
    <div class="card">
        <div class="card-body">
            <div id="invoice">
                <div class="toolbar hidden-print">
                    <div class="text-end">
                        <button type="button" class="btn btn-purple edit">Edit</button>
                        <button type="button" class="btn btn-purple save d-none">Save</button>
                        <button type="button" class="btn btn-danger export">Export as PDF</button>
                        <button type="button" class="btn btn-dark print">Print</button>
                    </div>
                    <hr>
                </div>
                <div class="invoice overflow-auto">
                    <form template_id="1">
                        <div style="min-width: 600px">
                            <header>
                                <div class="row">
                                    <div class="col">
                                        <a href="javascript:;">
                                        <img src="assets/images/logo-icon.png" width="80" alt="">
                                        </a>
                                    </div>
                                    <div class="col company-details">
                                        <h2 class="from_name">
                                            <a target="_blank" href="javascript:;">Reed Ireland</a>
                                        </h2>
                                        <div class="from_mobile">7845945951</div>
                                        <div class="from_email">reedIreland@gmail.com</div>
                                        <div class="from_address">Dublin</div>
                                    </div>
                                </div>
                            </header>
                            <main>
                                <div class="row contacts">
                                    <div class="col invoice-to">
                                        <div class="text-gray-light">INVOICE TO:</div>
                                        <h2 class="to_name">Yahoo Finance</h2>
                                        <div class="to_mobile">7845945950</div>
                                        <div class="to_email">yahoo@outlook.com</div>
                                        <div class="to_address">California</div>
                                    </div>
                                    <div class="col invoice-details">
                                        <h1 class="invoice-id">INV-1</h1>
                                        <div class="row align-items-right mt-3 justify-content-end">
                                            <label class="col-auto col-form-label text-end pe-1">Invoice Date: </label>
                                            <div class="invoice_date col-auto ps-0">
                                                <input type="text" class="form-control" style="width: 120px;"
                                                    value="17, Nov 2025"/>
                                                <p class="mt-2 mb-0">17, Nov 2025</p>
                                            </div>
                                        </div>
                                        <div class="row align-items-right justify-content-end">
                                            <label class="col-auto col-form-label text-end pe-1">Due Date: </label>
                                            <div class="due_date col-auto ps-0">
                                                <input type="text" class="form-control" style="width: 120px;"
                                                    value="17, Dec 2025"/>
                                                <p class="mt-2 mb-0">17, Dec 2025</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th class="text-left">DESCRIPTION</th>
                                            <th class="text-right">RATE MODE</th>
                                            <th class="text-right">DURATION</th>
                                            <th class="text-right">RATE AMOUNT</th>
                                            <th class="text-right">CURRRENCY</th>
                                            <th class="text-right">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        
                                            
                                            
                                            <tr contract_id="5">
                                                <td class="no">01</td>
                                                <td class="text-left">
                                                    <h3><a target="_blank" href="#">
                                                        Dinesh,</a> Madurai, Tamil Nadu</h3>
                                                    
                                                        <p class="m-0"><b>thru: </b>Sivarama Tech, Chennai, Tamil Nadu</p>
                                                    
                                                        <p class="m-0"><b>thru: </b>Sreerama Tech, Bangalore, Karnataka</p>
                                                    
                                                </td>
                                                <td class="rate-mode">Daily</td>
                                                <td class="duration">
                                                    <input type="text" class="form-control d-none" style="width: 40%;"/>
                                                    <p>0</p>
                                                </td>
                                                <td class="rate-amount">30000.0</td>
                                                <td class="currency">INR</td>
                                                <td class="total">0</td>
                                            </tr>
                                        
                                            
                                            
                                            <tr contract_id="6">
                                                <td class="no">02</td>
                                                <td class="text-left">
                                                    <h3><a target="_blank" href="#">
                                                        Palanisamy,</a> Salem, Tamil Nadu</h3>
                                                    
                                                        <p class="m-0"><b>thru: </b>Sreerama Tech, Bangalore, Karnataka</p>
                                                    
                                                </td>
                                                <td class="rate-mode">Monthly</td>
                                                <td class="duration">
                                                    <input type="text" class="form-control d-none" style="width: 40%;"/>
                                                    <p>0</p>
                                                </td>
                                                <td class="rate-amount">20000.0</td>
                                                <td class="currency">INR</td>
                                                <td class="total">0</td>
                                            </tr>
                                        
                                            
                                            
                                            <tr contract_id="7">
                                                <td class="no">03</td>
                                                <td class="text-left">
                                                    <h3><a target="_blank" href="#">
                                                        Macron,</a> Paris</h3>
                                                    
                                                </td>
                                                <td class="rate-mode">Monthly</td>
                                                <td class="duration">
                                                    <input type="text" class="form-control d-none" style="width: 40%;"/>
                                                    <p>0</p>
                                                </td>
                                                <td class="rate-amount">20000.0</td>
                                                <td class="currency">INR</td>
                                                <td class="total">0</td>
                                            </tr>
                                        
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="2"></td>
                                            <td colspan="2">SUBTOTAL</td>
                                            <td>1,00,000</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2"></td>
                                            <td colspan="2">TAX 10%</td>
                                            <td>10,000</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2"></td>
                                            <td colspan="2">GRAND TOTAL</td>
                                            <td>1,10,000</td>
                                        </tr>
                                    </tfoot>
                                </table>
                                <div class="thanks">Thank you!</div>
                                <div class="notices">
                                    <div>NOTICE:</div>
                                    <div class="notice">A finance charge of 1.5% will be made on unpaid balances after 30 days.</div>
                                </div>
                            </main>
                            <footer>Invoice was created on a computer and is valid without the signature and seal.</footer>
                        </div>
                        <!--DO NOT DELETE THIS div. IT is responsible for showing footer always at the bottom-->
                        <div></div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>`
    setInvoiceHtml(htmlString);
        setLoadingInvoice(false);
        setTabIdx(1);
    // fetch(`api/invoice/print-view?template_id=${selectedTemplateId}`, { credentials: "include" })
    //   .then((res) => {
    //     if (!res.ok) throw new Error("Failed to fetch invoice");
    //     return res.text();
    //   })
    //   .then((htmlString) => {
    //     setInvoiceHtml(htmlString);
    //     setLoadingInvoice(false);
    //     setTabIdx(1);
    //   })
    //   .catch(() => {
    //     setNotification({ severity: "error", message: "Failed to load invoice" });
    //     setLoadingInvoice(false);
    //   });
  }, [selectedTemplateId]);

  const handleMenuOpen = (event, templateId) => {
    setMenuAnchors((prev) => ({ ...prev, [templateId]: event.currentTarget }));
  };
  const handleMenuClose = (templateId) => {
    setMenuAnchors((prev) => ({ ...prev, [templateId]: null }));
  };

  const handleEditTemplate = (templateId) => {
    alert(`Edit Template ${templateId}`);
    handleMenuClose(templateId);
  };
  const handleDeleteTemplate = (templateId) => {
    alert(`Delete Template ${templateId}`);
    handleMenuClose(templateId);
  };

  return (
    <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>Invoices</Typography>
      <Tabs value={tabIdx} onChange={(_, v) => setTabIdx(v)} sx={{ mb: 2 }}>
        <Tab label="List Templates" />
        <Tab label="Invoice" disabled={!selectedTemplateId} />
      </Tabs>
      {tabIdx === 0 && (
        <Grid container spacing={4} justifyContent="center">
          {templateList.map((template) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={template.id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Card
                elevation={4}
                sx={{
                  width: 370,
                  maxWidth: "100%",
                  minHeight: 320,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: 5,
                  p: 0,
                  mx: "auto",
                }}
              >
                <CardHeader
                  title={
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {template.name}
                    </Typography>
                  }
                  action={
                    <>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, template.id)}
                        sx={{ color: "#868ca0" }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchors[template.id]}
                        open={Boolean(menuAnchors[template.id])}
                        onClose={() => handleMenuClose(template.id)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                      >
                        <MenuItem onClick={() => handleEditTemplate(template.id)}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleDeleteTemplate(template.id)}>
                          <DeleteIcon fontSize="small" sx={{ mr: 1, color: "#f44336" }} /> Delete
                        </MenuItem>
                      </Menu>
                    </>
                  }
                  sx={{
                    background: "#f0f2fa",
                    minHeight: 60,
                    px: 2,
                  }}
                />
                <Divider sx={{ mb: 0, mt: 0 }} />
                <CardContent sx={{ px: 2, py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {template.description || "No description available."}
                  </Typography>
                  <Typography sx={{ mb: 0, fontWeight: "bold" }}>
                    Projects:
                  </Typography>
                  {template.projects && template.projects.length > 0 ? (
                    <List dense disablePadding>
                      {template.projects.map((project) => (
                        <ListItem key={project.id} sx={{ pl: 1 }}>
                          <ListItemText
                            primary={
                              <span>
                                <b>{project.given_by}</b> &rarr; <b>{project.taken_by}</b>
                              </span>
                            }
                            secondary={
                              <span style={{ fontSize: 11 }}>
                                {project.rate_amount} {project.currency} ({project.rate_mode})
                              </span>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No projects
                    </Typography>
                  )}
                </CardContent>
                <Box sx={{ p: 1, pt: 0, textAlign: "right" }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setSelectedTemplateId(template.id)}
                    sx={{ minWidth: 120 }}
                  >
                    View Invoice
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {tabIdx === 1 && (
        <Box
          sx={{
            p: 2,
            bgcolor: "#f9faff",
            borderRadius: 2,
            height: 600,
            overflowY: "auto",
          }}
        >
          {loadingInvoice ? (
            <Typography sx={{ p: 2 }}>Loading invoice...</Typography>
          ) : invoiceHtml ? (
            <InvoiceRawHtml rawHtml={invoiceHtml} />
          ) : (
            <Typography sx={{ p: 2 }}>
              Select a template and click "View Invoice" to see details.
            </Typography>
          )}
        </Box>
      )}
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
