import React, { useState, useRef, useEffect } from "react";
import {
  Typography,
  TextField,
  IconButton,
  Collapse,
  Box,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Chip
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// --- Constants ---
const COLOR_THEMES = [
  { name: "Professional Blue", accent: "#2563eb", header: "#1e293b", bg: "#f8fafc", secondary: "#64748b" },
  { name: "Elegant Purple", accent: "#7c3aed", header: "#1e1b4b", bg: "#faf5ff", secondary: "#7c3aed" },
  { name: "Modern Green", accent: "#059669", header: "#064e3b", bg: "#f0fdf4", secondary: "#10b981" },
  { name: "Warm Orange", accent: "#ea580c", header: "#9a3412", bg: "#fff7ed", secondary: "#f97316" },
];

const ITEM_GRID_TEMPLATE = "48px 8px minmax(200px, 2.4fr) 8px 1.2fr 1fr 1.1fr 0.9fr 1.2fr 56px";

// --- Helper Functions ---
function formatDateToISO(dateStr) {
  if (!dateStr) return "";
  const [day, monthStr, year] = dateStr.replace(/,/g, "").split(" ");
  const months = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
  return `${year}-${months[monthStr]}-${day.padStart(2, "0")}`;
}

function formatISOToDisplay(dateISO) {
  if (!dateISO) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [year, month, day] = dateISO.split("-");
  return `${parseInt(day, 10)}, ${months[parseInt(month, 10) - 1]} ${year}`;
}

// --- Sub-components ---
const GridCell = ({ align = "left", children, sx = {} }) => (
  <Box sx={{ textAlign: align, px: 1.5, fontSize: "13px", ...sx }}>{children}</Box>
);

const NumberInput = ({ value, onChange, placeholder, align = "center", sx, ...props }) => (
  <TextField
    type="number"
    size="small"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    inputProps={{ style: { textAlign: align } }}
    sx={{
      ...sx,
      ".MuiInputBase-root": { fontSize: 13, height: 32 },
      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": { "-webkit-appearance": "none", margin: 0 },
      ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.12)" },
    }}
    {...props}
  />
);

const CenterInput = ({ value, onChange, placeholder, sx, ...props }) => (
  <TextField
    size="small"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    inputProps={{ style: { textAlign: "center" } }}
    sx={{
      ...sx,
      ".MuiInputBase-root": { fontSize: 13, height: 32 },
      ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.12)" },
    }}
    {...props}
  />
);

const SelectInput = ({ value, onChange, options, sx }) => (
  <Select
    size="small"
    value={value}
    onChange={onChange}
    sx={{
      ...sx,
      minWidth: 80,
      width: "100%",
      ".MuiSelect-select": { textAlign: "left", pl: 1, pr: 3, fontSize: 13 },
      ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.12)" },
    }}
  >
    {options.map((opt) => (
      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>{opt}</MenuItem>
    ))}
  </Select>
);

export default function InvoiceTemplate({
  invoice = {
    invoiceId: "INV-1",
    from: { name: "Yahoo Finance", mobile: "7845945950", email: "yahoo@outlook.com", address: "California" },
    to: { name: "Reed Ireland", mobile: "7845945951", email: "reedIreland@gmail.com", address: "Dublin" },
    invoicedate: "20, Nov 2025",
    duedate: "20, Dec 2025",
    invoiceitems: [
      { id: 1, name: "Dinesh, Madurai, Tamil Nadu", duration: 0, ratemode: "Daily", rateamount: 30000, currency: "INR", description: "" },
      { id: 2, name: "Palanisamy, Salem, Tamil Nadu", duration: 0, ratemode: "Monthly", rateamount: 20000, currency: "INR", description: "" },
      { id: 3, name: "Macron, Paris", duration: 0, ratemode: "Monthly", rateamount: 20000, currency: "INR", description: "" },
    ],
    notice: "A finance charge of 1.5% will be made on unpaid balances after 30 days.",
  },
  template = { name: "Invoice" },
}) {
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = COLOR_THEMES[themeIdx];

  // --- View states ---
  const [viewMode, setViewMode] = useState("full"); 
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // --- Data states ---
  const [editInvoiceDate, setEditInvoiceDate] = useState(formatDateToISO(invoice.invoicedate));
  const [editDueDate, setEditDueDate] = useState(formatDateToISO(invoice.duedate));
  const [localInvoiceDate, setLocalInvoiceDate] = useState(invoice.invoicedate);
  const [localDueDate, setLocalDueDate] = useState(invoice.duedate);
  const [localInvoiceItems, setLocalInvoiceItems] = useState(invoice.invoiceitems);
  const [savedExpenses, setSavedExpenses] = useState(invoice.invoiceitems.map(() => []));
  const [additionalExpenses, setAdditionalExpenses] = useState(
    invoice.invoiceitems.map(item => [{ label: "", amount: "", duration: 0, currency: "INR", description: "", ratemode: "Flat" }])
  );
  const [expandedItems, setExpandedItems] = useState({});
  const [taxPercent, setTaxPercent] = useState(10);
  const [taxAmount, setTaxAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // --- Production Print Fix ---
  const handlePrint = () => {
    // We use the browser's native print. 
    // The "@media print" styles in the Sx props below handle the hiding of UI.
    window.print();
  };

  // --- Calculations ---
  useEffect(() => {
    let subtotalCalc = 0;
    const itemsToSum = viewMode === "full" ? localInvoiceItems.map((_, i) => i) : [selectedItemIdx];

    itemsToSum.forEach((i) => {
      const item = localInvoiceItems[i];
      if (!item) return;
      const expenseTotal = savedExpenses[i].reduce((sum, exp) => sum + (exp.duration > 0 ? exp.amount * exp.duration : exp.amount), 0);
      const baseTotal = item.duration > 0 ? item.rateamount * item.duration : item.rateamount;
      subtotalCalc += baseTotal + expenseTotal;
    });

    const tax = (subtotalCalc * taxPercent) / 100;
    setTaxAmount(tax);
    setGrandTotal(subtotalCalc + tax);
  }, [taxPercent, localInvoiceItems, savedExpenses, viewMode, selectedItemIdx]);

  const toggleExpand = (idx) => setExpandedItems(p => ({ ...p, [idx]: !p[idx] }));

  const handleSavedExpenseChange = (rIdx, eIdx, key, val) => {
    const next = [...savedExpenses];
    next[rIdx][eIdx] = { ...next[rIdx][eIdx], [key]: val };
    setSavedExpenses(next);
  };

  const handleConfirmAddExpense = (rIdx) => {
    const draft = additionalExpenses[rIdx][0];
    if (!draft.label && !draft.amount) return;
    const nextSaved = [...savedExpenses];
    nextSaved[rIdx].push({ ...draft });
    setSavedExpenses(nextSaved);
    const nextDrafts = [...additionalExpenses];
    nextDrafts[rIdx] = [{ label: "", amount: "", duration: 0, currency: "INR", description: "", ratemode: "Flat" }];
    setAdditionalExpenses(nextDrafts);
  };

  // --- Render Helpers ---
  const renderInvoiceItem = (item, idx) => {
    const baseTotal = item.duration > 0 ? item.rateamount * item.duration : item.rateamount;
    const expenseSum = savedExpenses[idx].reduce((sum, e) => sum + (e.duration > 0 ? e.amount * e.duration : e.amount), 0);
    const rowTotal = baseTotal + expenseSum;

    return (
      <Box key={item.id} sx={{ display: "grid", gridTemplateColumns: ITEM_GRID_TEMPLATE, alignItems: "center", px: 5, py: 2, borderBottom: "1px solid rgba(148,163,184,0.15)", bgcolor: idx % 2 === 0 ? "white" : "rgba(248,250,252,0.6)" }}>
        <GridCell align="center" sx={{ fontWeight: 600 }}>{String(idx + 1).padStart(2, "0")}</GridCell>
        <GridCell />
        <GridCell>
          {isEditing ? (
            <TextField fullWidth size="small" value={item.name} onChange={(e) => {
              const next = [...localInvoiceItems]; next[idx].name = e.target.value; setLocalInvoiceItems(next);
            }} />
          ) : <Typography fontWeight={500} fontSize={13}>{item.name}</Typography>}
        </GridCell>
        <GridCell />
        <GridCell align="center">{isEditing ? <SelectInput value={item.ratemode} options={["Flat", "Daily", "Monthly"]} onChange={(e) => {
            const next = [...localInvoiceItems]; next[idx].ratemode = e.target.value; setLocalInvoiceItems(next);
        }} /> : item.ratemode}</GridCell>
        <GridCell align="center">{isEditing ? <NumberInput value={item.duration} onChange={(e) => {
            const next = [...localInvoiceItems]; next[idx].duration = Number(e.target.value); setLocalInvoiceItems(next);
        }} /> : item.duration || "-"}</GridCell>
        <GridCell align="center">{isEditing ? <NumberInput value={item.rateamount} onChange={(e) => {
            const next = [...localInvoiceItems]; next[idx].rateamount = Number(e.target.value); setLocalInvoiceItems(next);
        }} /> : item.rateamount.toLocaleString()}</GridCell>
        <GridCell align="center">{item.currency}</GridCell>
        <GridCell align="right" sx={{ fontWeight: 700, color: theme.accent }}>{rowTotal.toLocaleString()}</GridCell>
        <GridCell align="right" sx={{ "@media print": { display: "none" } }}>
          <IconButton size="small" onClick={() => toggleExpand(idx)}>{expandedItems[idx] ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
        </GridCell>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: 5, px: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
      
      {/* --- UI CONTROLS (Hidden on Print) --- */}
      <Box sx={{ 
        width: "100%", maxWidth: 1160, mb: 3, p: 2, bgcolor: "white", borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: 1,
        "@media print": { display: "none" } 
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ToggleButtonGroup value={viewMode} exclusive onChange={(e, v) => v && setViewMode(v)} size="small">
            <ToggleButton value="full">Full Invoice</ToggleButton>
            <ToggleButton value="individual">Individual</ToggleButton>
          </ToggleButtonGroup>

          {viewMode === "individual" && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Select Row</InputLabel>
              <Select label="Select Row" value={selectedItemIdx} onChange={(e) => setSelectedItemIdx(e.target.value)}>
                {localInvoiceItems.map((item, idx) => <MenuItem key={idx} value={idx}>{item.name}</MenuItem>)}
              </Select>
            </FormControl>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton onClick={() => setIsEditing(!isEditing)} sx={{ bgcolor: isEditing ? theme.accent : "transparent", color: isEditing ? "white" : "inherit" }}>
            {isEditing ? <SaveIcon /> : <EditIcon />}
          </IconButton>
          <IconButton onClick={handlePrint}><PrintIcon /></IconButton>
        </Box>
      </Box>

      {/* --- THE INVOICE CARD --- */}
      <Card sx={{ width: "100%", maxWidth: 1160, borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        {/* Header */}
        <Box sx={{ p: 4, bgcolor: theme.bg, borderBottom: `4px solid ${theme.accent}`, display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h4" fontWeight={800} color={theme.header}>{template.name}</Typography>
            <Typography color="text.secondary">#{invoice.invoiceId}</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography fontWeight={700}>{invoice.from.name}</Typography>
            <Typography variant="body2" color="text.secondary">{invoice.from.address}</Typography>
          </Box>
        </Box>

        {/* Billed To */}
        <CardContent sx={{ px: 5, py: 4, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <Box>
            <Typography variant="overline" color="text.secondary">BILLED TO</Typography>
            <Typography variant="h6" fontWeight={700}>{invoice.to.name}</Typography>
            <Typography variant="body2" color="text.secondary">{invoice.to.address}</Typography>
            <Typography variant="body2" color="text.secondary">{invoice.to.email}</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="overline" color="text.secondary">DATE</Typography>
            <Typography fontWeight={600} display="block">{localInvoiceDate}</Typography>
            <Typography variant="overline" color="text.secondary" sx={{ mt: 2, display: "block" }}>DUE DATE</Typography>
            <Typography fontWeight={600}>{localDueDate}</Typography>
          </Box>
        </CardContent>

        {/* Table */}
        <Box sx={{ px: 5, py: 1.5, bgcolor: "grey.100", display: "grid", gridTemplateColumns: ITEM_GRID_TEMPLATE, fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>
          <GridCell /> <GridCell /> <GridCell>Description</GridCell> <GridCell /> <GridCell align="center">Mode</GridCell> <GridCell align="center">Qty</GridCell> <GridCell align="center">Rate</GridCell> <GridCell align="center">Curr</GridCell> <GridCell align="right">Total</GridCell> <GridCell />
        </Box>

        <Box>
          {localInvoiceItems.map((item, idx) => {
            if (viewMode === "individual" && idx !== selectedItemIdx) return null;
            return (
              <React.Fragment key={idx}>
                {renderInvoiceItem(item, idx)}
                {/* Simplified Expense Rendering */}
                <Collapse in={expandedItems[idx]}>
                   <Box sx={{ pl: 10, py: 2, bgcolor: "grey.50" }}>
                      {savedExpenses[idx].map((exp, ei) => (
                        <Typography key={ei} variant="caption" display="block">• {exp.label}: {exp.amount.toLocaleString()}</Typography>
                      ))}
                      {isEditing && (
                        <Button size="small" startIcon={<AddBoxIcon />} onClick={() => handleConfirmAddExpense(idx)}>Add Expense</Button>
                      )}
                   </Box>
                </Collapse>
              </React.Fragment>
            );
          })}
        </Box>

        {/* Totals */}
        <Box sx={{ p: 5, display: "flex", justifyContent: "flex-end" }}>
          <Box sx={{ width: 300 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography fontWeight={600}>{(grandTotal - taxAmount).toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography color="text.secondary">Tax ({taxPercent}%)</Typography>
              <Typography>{taxAmount.toLocaleString()}</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: theme.accent, color: "white", p: 2, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={700}>Total</Typography>
              <Typography variant="h5" fontWeight={800}>{grandTotal.toLocaleString()}</Typography>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}