// InvoiceTemplate.jsx - Revamped for perfect alignment and cleaner code
import React, { useState, useRef, useEffect } from "react";
import {
  Typography,
  TextField,
  IconButton,
  Collapse,
  Box,
  Button,
  Chip,
  Card,
  CardContent,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// --- Constants & Config ---
const COLOR_THEMES = [
  { name: "Professional Blue", accent: "#2563eb", header: "#1e293b", bg: "#f8fafc", notice: "#dbeafe", secondary: "#64748b" },
  { name: "Elegant Purple", accent: "#7c3aed", header: "#1e1b4b", bg: "#faf5ff", notice: "#ede9fe", secondary: "#7c3aed" },
  { name: "Modern Green", accent: "#059669", header: "#064e3b", bg: "#f0fdf4", notice: "#d1fae5", secondary: "#10b981" },
  { name: "Warm Orange", accent: "#ea580c", header: "#9a3412", bg: "#fff7ed", notice: "#fed7aa", secondary: "#f97316" },
];

const ITEM_GRID_TEMPLATE = "48px 8px minmax(200px, 2.4fr) 8px 1.2fr 1fr 1.1fr 0.9fr 1.2fr 56px";

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

// --- Sub-components for Cleaner Rendering ---
const GridCell = ({ align = "left", children, sx = {} }) => (
  <Box sx={{ textAlign: align, px: 1.5, fontSize: "13px", ...sx }}>{children}</Box>
);

const NumberInput = ({ value, onChange, placeholder, align = "right", sx, ...props }) => (
  <TextField
    type="number"
    size="small"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    inputProps={{ style: { textAlign: align } }}
    sx={{
      ...sx,
      ".MuiInputBase-root": { fontSize: 13, height: 32, minHeight: 32, pr: 0 },
      "& input": { pr: 1.5, pl: 0.5 },
      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": { "-webkit-appearance": "none", margin: 0 },
      "& input::placeholder": { color: "#000000", opacity: 0.7 },
      ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.12)", borderWidth: "1px" },
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
      ".MuiInputBase-root": { fontSize: 13, height: 32, minHeight: 32 },
      "& input::placeholder": { color: "#000000", opacity: 0.7 },
      ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.12)", borderWidth: "1px" },
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
      ".MuiSelect-select": { textAlign: "center", pl: 1, pr: 3, fontSize: 13 },
      ".MuiInputBase-root": { height: 32, minHeight: 32 },
      ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.12)", borderWidth: "1px" },
    }}
  >
    {options.map((opt) => (
      <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>{opt}</MenuItem>
    ))}
  </Select>
);

// --- Main Component ---
export default function InvoiceTemplate({
  invoice = {
    invoiceId: "INV-1",
    from: { name: "Yahoo Finance", mobile: "7845945950", email: "yahoo@outlook.com", address: "California" },
    to: { name: "Reed Ireland", mobile: "7845945951", email: "reedIreland@gmail.com", address: "Dublin" },
    invoicedate: "20, Nov 2025",
    duedate: "20, Dec 2025",
    invoiceitems: [
      { id: 1, name: "Dinesh, Madurai, Tamil Nadu", duration: 0, ratemode: "Daily", rateamount: 30000, currency: "INR", total: 0 },
      { id: 2, name: "Palanisamy, Salem, Tamil Nadu", duration: 0, ratemode: "Monthly", rateamount: 20000, currency: "INR", total: 0 },
      { id: 3, name: "Macron, Paris", duration: 0, ratemode: "Monthly", rateamount: 20000, currency: "INR", total: 0 },
    ],
    subtotal: 100000, tax: 10000, total: 110000,
    notice: "A finance charge of 1.5% will be made on unpaid balances after 30 days.",
  },
  template = { name: "Invoice" },
}) {
  const componentRef = useRef(null);
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = COLOR_THEMES[themeIdx];

  const [isEditing, setIsEditing] = useState(false);
  const [editInvoiceDate, setEditInvoiceDate] = useState(formatDateToISO(invoice.invoicedate));
  const [editDueDate, setEditDueDate] = useState(formatDateToISO(invoice.duedate));
  
  const [localInvoiceDate, setLocalInvoiceDate] = useState(invoice.invoicedate);
  const [localDueDate, setLocalDueDate] = useState(invoice.duedate);
  const [localInvoiceItems, setLocalInvoiceItems] = useState(invoice.invoiceitems);

  const [savedExpenses, setSavedExpenses] = useState(invoice.invoiceitems.map(() => []));
  const [additionalExpenses, setAdditionalExpenses] = useState(
    invoice.invoiceitems.map(item => [{
      label: "", 
      amount: "", 
      duration: 0, 
      currency: item.currency || "INR", 
      description: "", 
      ratemode: item.ratemode || "Flat"
    }])
  );
  const [expandedItems, setExpandedItems] = useState({});
  const [taxPercent, setTaxPercent] = useState(((invoice.tax / invoice.subtotal) * 100) || 10);
  const [taxAmount, setTaxAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Calculations
  useEffect(() => {
    let subtotalCalc = 0;
    localInvoiceItems.forEach((item, i) => {
      // 1. Saved Expenses
      const expenseTotal = savedExpenses[i].reduce((sum, exp) => {
        const amt = Number(exp.amount) || 0;
        return sum + (exp.duration && exp.duration > 0 ? amt * exp.duration : amt);
      }, 0);

      // 2. Draft Expense (Additional)
      const lastExpense = additionalExpenses[i][additionalExpenses[i].length - 1];
      let lastExpenseAmt = 0;
      if (lastExpense && (lastExpense.label.trim() !== "" || lastExpense.amount !== "")) {
        lastExpenseAmt = Number(lastExpense.amount) || 0;
      }

      // 3. Base Item
      const baseTotal = item.duration && item.duration > 0 ? item.rateamount * item.duration : item.rateamount;
      
      subtotalCalc += baseTotal + expenseTotal + lastExpenseAmt;
    });

    const tax = (subtotalCalc * taxPercent) / 100;
    setTaxAmount(tax);
    setGrandTotal(subtotalCalc + tax);
  }, [taxPercent, localInvoiceItems, savedExpenses, additionalExpenses]);

  // Handlers
  const handleEditToggle = () => {
    if (!isEditing) {
      setEditInvoiceDate(formatDateToISO(localInvoiceDate));
      setEditDueDate(formatDateToISO(localDueDate));
    } else {
      setLocalInvoiceDate(formatISOToDisplay(editInvoiceDate));
      setLocalDueDate(formatISOToDisplay(editDueDate));
    }
    setIsEditing(!isEditing);
  };

  const handlePrint = () => {
    const content = componentRef.current;
    if (!content) return;

    const win = window.open("", "", "width=900,height=600");
    const doc = win.document;

    doc.write("<html><head><title>Invoice</title>");

    const styles = document.querySelectorAll("style, link[rel='stylesheet']");
    styles.forEach((style) => {
      doc.write(style.outerHTML);
    });

    doc.write(`
      <style>
        body { margin: 0; padding: 20px; background-color: white; font-family: sans-serif; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        @page { margin: 10mm; }
        @media print { .no-print { display: none !important; } }
      </style>
    `);
    doc.write("</head><body>");
    doc.write(content.innerHTML);
    doc.write("</body></html>");
    doc.close();

    win.focus();
    setTimeout(() => {
      win.print();
      win.close(); 
    }, 500);
  };

  const toggleExpand = (idx) => setExpandedItems(p => ({ ...p, [idx]: !p[idx] }));

  // Helper State Updates
  const getExpensesTotal = (idx) => {
    const savedSum = savedExpenses[idx].reduce((sum, e) => sum + ((e.duration ? e.amount * e.duration : e.amount) || 0), 0);
    const draft = additionalExpenses[idx][additionalExpenses[idx].length - 1];
    const draftSum = (draft.label || draft.amount) ? Number(draft.amount || 0) : 0;
    return savedSum + draftSum;
  };

  const handleSavedExpenseChange = (rIdx, eIdx, key, val) => {
    const next = [...savedExpenses];
    next[rIdx][eIdx] = { ...next[rIdx][eIdx], [key]: val };
    setSavedExpenses(next);
  };
  
  const handleRemoveExpense = (rIdx, eIdx) => {
    const next = [...savedExpenses];
    next[rIdx] = next[rIdx].filter((_, i) => i !== eIdx);
    setSavedExpenses(next);
  };

  const handleAddExpChange = (rIdx, key, val) => {
    const next = [...additionalExpenses];
    const last = next[rIdx].length - 1;
    next[rIdx][last] = { ...next[rIdx][last], [key]: val };
    setAdditionalExpenses(next);
  };

  // ✅ FIXED: Proper immutable state update for expense saving
  const handleConfirmAddExpense = (rIdx) => {
    const nextDrafts = [...additionalExpenses];
    const lastDraft = nextDrafts[rIdx][nextDrafts[rIdx].length - 1];
    if (!lastDraft.label && !lastDraft.amount) return;

    // Move to saved
    const nextSaved = [...savedExpenses];
    nextSaved[rIdx].push({ ...lastDraft });
    setSavedExpenses(nextSaved);

    // FIXED: Replace entire array slice with NEW objects (immutable update)
    nextDrafts[rIdx] = [{
      label: "", 
      amount: "", 
      duration: 0, 
      currency: localInvoiceItems[rIdx].currency || "INR", 
      description: "", 
      ratemode: "Flat"
    }];
    setAdditionalExpenses(nextDrafts);
  };

  // --- Render Helpers for Row Logic ---
  const renderInvoiceItem = (item, idx) => {
    const baseTotal = item.duration && item.duration > 0 ? item.rateamount * item.duration : item.rateamount;
    const rowTotal = baseTotal + getExpensesTotal(idx);

    return (
      <Box
        key={item.id}
        sx={{
          display: "grid",
          gridTemplateColumns: ITEM_GRID_TEMPLATE,
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: !expandedItems[idx] && idx < localInvoiceItems.length - 1 ? "1px solid rgba(148,163,184,0.15)" : "none",
          backgroundColor: idx % 2 === 0 ? "white" : "rgba(248,250,252,0.6)",
          "&:hover": { backgroundColor: "rgba(236,246,255,0.4)" },
          transition: "background-color 0.2s",
        }}
      >
        <GridCell align="center" sx={{ color: theme.secondary, fontWeight: 600 }}>{String(idx + 1).padStart(2, "0")}</GridCell>
        <GridCell />
        
        {/* Description - Seamless Input */}
        <GridCell sx={isEditing ? { px: 0 } : {}}>
          {isEditing ? (
            <TextField
              multiline
              rows={1}
              value={item.name}
              onChange={(e) => {
                const newItems = [...localInvoiceItems];
                newItems[idx].name = e.target.value;
                setLocalInvoiceItems(newItems);
              }}
              sx={{
                width: "100%",
                ".MuiInputBase-root": { fontSize: 13, p: "10px", border: "1px solid rgba(0, 0, 0, 0.12)", borderRadius: 1 },
                "& fieldset": { border: "none" },
                "& textarea": { pl: 1.5, lineHeight: 1.5 },
                "& textarea::placeholder": { color: "#000000", opacity: 0.7 }
              }}
            />
          ) : <Typography fontWeight={500} fontSize={13}>{item.name}</Typography>}
          {!expandedItems[idx] && <Typography variant="caption" color="text.secondary" display="block">{item.description}</Typography>}
        </GridCell>

        <GridCell />

        {/* Rate Mode - Seamless */}
        <GridCell align="center" sx={isEditing ? { px: 0 } : {}}>
          {isEditing ? (
            <SelectInput
              value={item.ratemode}
              options={["Flat", "Daily", "Monthly", "Hourly"]}
              onChange={(e) => {
                const newItems = [...localInvoiceItems];
                newItems[idx].ratemode = e.target.value;
                setLocalInvoiceItems(newItems);
              }}
              sx={{ ".MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />
          ) : item.ratemode}
        </GridCell>
        
        {/* Duration - Seamless */}
        <GridCell align="center" sx={isEditing ? { px: 0 } : {}}>
          {isEditing ? (
            <NumberInput
              value={item.duration}
              align="center"
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                const newItems = [...localInvoiceItems];
                newItems[idx].duration = val;
                setLocalInvoiceItems(newItems);
              }}
              sx={{ width: 60, ".MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />
          ) : item.duration || "-"}
        </GridCell>

        {/* Rate Amount - Seamless */}
        <GridCell align="center" sx={isEditing ? { px: 0 } : {}}>
          {isEditing ? (
            <NumberInput
              value={item.rateamount}
              align="center"
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                const newItems = [...localInvoiceItems];
                newItems[idx].rateamount = val;
                setLocalInvoiceItems(newItems);
              }}
              sx={{ width: 80, ".MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />
          ) : item.rateamount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </GridCell>

        {/* Currency - Seamless */}
        <GridCell align="center" sx={isEditing ? { px: 0 } : {}}>
          {isEditing ? (
            <CenterInput
              value={item.currency}
              onChange={(e) => {
                const newItems = [...localInvoiceItems];
                newItems[idx].currency = e.target.value;
                setLocalInvoiceItems(newItems);
              }}
              sx={{ width: 50, ".MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />
          ) : item.currency}
        </GridCell>

        <GridCell align="right" sx={{ fontWeight: 700, color: theme.accent, fontSize: 14 }}>
          {rowTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </GridCell>
        <GridCell align="right">
          <IconButton size="small" onClick={() => toggleExpand(idx)} sx={{ color: theme.secondary }}>
            {expandedItems[idx] ? <ExpandLessIcon fontSize="small"/> : <ExpandMoreIcon fontSize="small"/>}
          </IconButton>
        </GridCell>
      </Box>
    );
  };

  const renderExpenseRows = (mainIdx) => {
    if (!expandedItems[mainIdx]) return null;

    return (
      <Collapse in={expandedItems[mainIdx]} timeout="auto" unmountOnExit>
      <Box sx={{ backgroundColor: "rgba(248,250,252,0.4)", borderBottom: "1px solid rgba(148,163,184,0.2)", pb: 2 }}>
        <Typography variant="overline" sx={{ display: "block", pl: "90px", pr: 3, pt: 2, pb: 1, color: theme.secondary, fontWeight: 600, fontSize: 11, letterSpacing: 1 }}>
          ADDITIONAL EXPENSES
        </Typography>

        {/* Saved Expenses - PERFECT MATCHING STYLING */}
        {savedExpenses[mainIdx].map((exp, eIdx) => (
          <Box
            key={`${mainIdx}-${eIdx}`}
            sx={{
              display: "grid",
              gridTemplateColumns: ITEM_GRID_TEMPLATE,
              alignItems: "center",
              px: 4,
              py: 1,
              borderTop: eIdx === 0 ? "1px solid rgba(148,163,184,0.1)" : "1px solid rgba(148,163,184,0.05)",
              backgroundColor: "rgba(236,246,255,0.2)",
            }}
          >
            <GridCell />
            <GridCell />
            
            {/* Label */}
            <GridCell sx={{ px: 0 }}>
              {isEditing ? (
                <TextField
                  multiline
                  rows={1}
                  placeholder="Label"
                  value={exp.label || ""}
                  onChange={(e) => handleSavedExpenseChange(mainIdx, eIdx, "label", e.target.value)}
                  sx={{
                    width: "100%",
                    ".MuiInputBase-root": { fontSize: 13, p: "10px", border: "1px solid rgba(0, 0, 0, 0.12)", borderRadius: 1 },
                    "& fieldset": { border: "none" },
                    "& textarea": { pl: 1.5, lineHeight: 1.5 },
                    "& textarea::placeholder": { color: "#000000", opacity: 0.7 }
                  }}
                />
              ) : (
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{exp.label || "Expense"}</Typography>
              )}
            </GridCell>
            
            <GridCell />
            
            {/* Rate Mode */}
            <GridCell align="center" sx={{ px: 0 }}>
              {isEditing ? (
                <SelectInput 
                  value={exp.ratemode || "Flat"} 
                  options={["Flat","Daily","Monthly","Hourly"]}
                  onChange={(e) => handleSavedExpenseChange(mainIdx, eIdx, "ratemode", e.target.value)} 
                  sx={{ ".MuiOutlinedInput-notchedOutline": { border: "none" } }} 
                /> 
              ) : <Typography sx={{ fontSize: 13 }}>{exp.ratemode || "-"}</Typography>}
            </GridCell>
            
            {/* Duration */}
            <GridCell align="center" sx={{ px: 0 }}>
              {isEditing ? (
                <NumberInput 
                  value={exp.duration} 
                  placeholder="Dur"
                  align="center"
                  onChange={(e) => handleSavedExpenseChange(mainIdx, eIdx, "duration", Number(e.target.value))} 
                  sx={{ width: 60, ".MuiOutlinedInput-notchedOutline": { border: "none" } }} 
                />
              ) : exp.duration || "-"}
            </GridCell>
            
            {/* Amount */}
            <GridCell align="center" sx={{ px: 0 }}>
              {isEditing ? (
                <NumberInput 
                  value={exp.amount} 
                  placeholder="Amt"
                  align="center"
                  onChange={(e) => handleSavedExpenseChange(mainIdx, eIdx, "amount", Number(e.target.value))} 
                  sx={{ width: 80, ".MuiOutlinedInput-notchedOutline": { border: "none" } }} 
                />
              ) : Number(exp.amount || 0).toLocaleString(undefined, {minimumFractionDigits:2})}
            </GridCell>
            
            {/* Currency */}
            <GridCell align="center" sx={{ px: 0 }}>
              {isEditing ? (
                <CenterInput 
                  value={exp.currency} 
                  placeholder="Cur"
                  onChange={(e) => handleSavedExpenseChange(mainIdx, eIdx, "currency", e.target.value)} 
                  sx={{ width: 50, ".MuiOutlinedInput-notchedOutline": { border: "none" } }} 
                />
              ) : exp.currency}
            </GridCell>
            
            <GridCell align="right" sx={{ fontWeight: 600, color: theme.accent }}>
              {((exp.duration ? exp.amount * exp.duration : exp.amount) || 0).toLocaleString(undefined,{minimumFractionDigits:2})}
            </GridCell>
            
            {/* Delete Button */}
            <GridCell align="right">
              {isEditing && (
                <IconButton size="small" color="error" onClick={() => handleRemoveExpense(mainIdx, eIdx)}>
                  <DeleteIcon fontSize="small"/>
                </IconButton>
              )}
            </GridCell>
            
            {/* Description input */}
            {isEditing ? (
              <Box sx={{
                gridColumn: "1 / -1",
                px: 7,
                pt: 0.5,
                pb: 1,
              }}>
                <TextField 
                  size="small" 
                  placeholder="Description" 
                  multiline 
                  rows={1} 
                  value={exp.description || ""}
                  onChange={(e) => handleSavedExpenseChange(mainIdx, eIdx, "description", e.target.value)}
                  sx={{ 
                    width: "100%",
                    ".MuiInputBase-root": { 
                      fontSize: 12, 
                      pl: 1.5, 
                      pr: 1.5,
                      border: "1px solid rgba(0, 0, 0, 0.12)", 
                      borderRadius: 1 
                    }, 
                    "& fieldset": { border: "none" }, 
                    "& textarea": { 
                      padding: "8px 0",
                      "::placeholder": { color: "#000000", opacity: 0.7 } 
                    }
                  }} 
                />
              </Box>
            ):<Typography sx={{ fontSize: 12, fontWeight: 500,px:7 }}>{exp.label || "Expense"}</Typography>}
          </Box>
        ))}

        {/* Add New Expense Row (Edit Mode Only) */}
        {isEditing && (
          <Box sx={{
            display: "grid",
            gridTemplateColumns: ITEM_GRID_TEMPLATE,
            alignItems: "center",
            px: 3, 
            py: 1,
            borderTop: "1px dashed rgba(148,163,184,0.3)", 
          }}>
            <GridCell />
            <GridCell />
            
            {/* New Expense Label */}
            <GridCell sx={{ px: 0 }}>
              <TextField
                multiline
                rows={1}
                placeholder="New Expense Label"
                value={additionalExpenses[mainIdx][additionalExpenses[mainIdx].length-1].label}
                onChange={(e) => handleAddExpChange(mainIdx, "label", e.target.value)}
                sx={{
                  width: "100%",
                  ".MuiInputBase-root": { fontSize: 13, p: "10px", border: "1px solid rgba(0, 0, 0, 0.12)", borderRadius: 1 },
                  "& fieldset": { border: "none" },
                  "& textarea": { pl: 1.5, lineHeight: 1.5 },
                  "& textarea::placeholder": { color: "#000000", opacity: 0.7 }
                }}
              />
            </GridCell>
            
            <GridCell />
            
            {/* Rate Mode */}
            <GridCell align="center" sx={{ px: 0 }}>
              <SelectInput 
                value={additionalExpenses[mainIdx][additionalExpenses[mainIdx].length-1].ratemode} 
                options={["Flat","Daily","Monthly","Hourly"]}
                onChange={(e) => handleAddExpChange(mainIdx, "ratemode", e.target.value)} 
                sx={{ ".MuiOutlinedInput-notchedOutline": { border: "none" } }} 
              /> 
            </GridCell>
            
            {/* Duration */}
            <GridCell align="center" sx={{ px: 0 }}>
              <NumberInput 
                value={additionalExpenses[mainIdx][additionalExpenses[mainIdx].length-1].duration} 
                placeholder="Dur"
                align="center"
                onChange={(e) => handleAddExpChange(mainIdx, "duration", Number(e.target.value))}  
                sx={{ width: 60, ".MuiOutlinedInput-notchedOutline": { border: "none" } }} 
              />
            </GridCell>
            
            {/* Amount */}
            <GridCell align="center" sx={{ px: 0 }}>
              <NumberInput 
                value={additionalExpenses[mainIdx][additionalExpenses[mainIdx].length-1].amount} 
                placeholder="Amt"
                align="center"
                onChange={(e) => handleAddExpChange(mainIdx, "amount", Number(e.target.value))} 
                sx={{ width: 80, ".MuiOutlinedInput-notchedOutline": { border: "none" } }} 
              />
            </GridCell>
            
            {/* Currency */}
            <GridCell align="center" sx={{ px: 0 }}>
              <CenterInput 
                value={additionalExpenses[mainIdx][additionalExpenses[mainIdx].length-1].currency} 
                placeholder="Cur"
                onChange={(e) => handleAddExpChange(mainIdx, "currency", e.target.value)} 
                sx={{ width: 50, ".MuiOutlinedInput-notchedOutline": { border: "none" } }} 
              />
            </GridCell>
            
            <GridCell />
            
            {/* Add Button */}
            <GridCell align="right">
              <IconButton size="small" onClick={() => handleConfirmAddExpense(mainIdx)} sx={{ color: theme.accent }}>
                <AddBoxIcon fontSize="small"/>
              </IconButton>
            </GridCell>
            
            {/* Description input */}
            <Box sx={{
              gridColumn: "1 / -1",
              px: 7,
              pt: 0.5,
              pb: 1,
            }}>
              <TextField 
                size="small" 
                placeholder="Description" 
                multiline 
                rows={1} 
                value={additionalExpenses[mainIdx][additionalExpenses[mainIdx].length-1].description}
                onChange={(e) => handleAddExpChange(mainIdx, "description", e.target.value)}
                sx={{ 
                  width: "100%",
                  ".MuiInputBase-root": { 
                    fontSize: 12, 
                    pl: 1.5, 
                    pr: 1.5,
                    border: "1px solid rgba(0, 0, 0, 0.12)", 
                    borderRadius: 1 
                  }, 
                  "& fieldset": { border: "none" }, 
                  "& textarea": { 
                    padding: "8px 0",
                    "::placeholder": { color: "#000000", opacity: 0.7 } 
                  }
                }} 
              />
            </Box>
          </Box>
        )}
      </Box>
      </Collapse>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "radial-gradient(circle at top, #e5edff 0%, #f8fafc 40%, #f4f4f5 100%)", display: "flex", justifyContent: "center", alignItems: "flex-start", py: 5, px: 2 }}>
      <Card ref={componentRef} sx={{ width: "100%", maxWidth: 1160, borderRadius: 3, boxShadow: "0 22px 60px rgba(15,23,42,0.16)", border: "1px solid rgba(148,163,184,0.25)", overflow: "hidden", backgroundColor: "white" }}>
        
        {/* Header Section */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 1.75, borderBottom: "1px solid rgba(148,163,184,0.3)", background: `linear-gradient(90deg, ${theme.accent}12, white)` }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.header }}>{template?.name || "Invoice"}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Select size="small" value={themeIdx} onChange={(e) => setThemeIdx(e.target.value)} sx={{ height: 32, fontSize: 13 }}>{COLOR_THEMES.map((t, i) => <MenuItem key={i} value={i}>{t.name}</MenuItem>)}</Select>
            <IconButton size="small" onClick={handleEditToggle} sx={{ bgcolor: isEditing ? theme.accent : "transparent", color: isEditing?"white":"inherit", "&:hover":{ bgcolor: isEditing?theme.accent+"E6":"#f1f5f9"} }}>
              {isEditing ? <SaveIcon fontSize="small"/> : <EditIcon fontSize="small"/>}
            </IconButton>
            <IconButton size="small" onClick={handlePrint} title="Export PDF / Print"><PictureAsPdfIcon fontSize="small"/></IconButton>
            <IconButton size="small" onClick={handlePrint} title="Print"><PrintIcon fontSize="small"/></IconButton>
          </Box>
        </Box>

        {/* Address & Date Section */}
        <CardContent sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.2fr 1.1fr" }, gap: 3, px: 3, py: 3, backgroundColor: theme.bg }}>
          <Box>
            <Typography variant="overline" color="text.secondary">FROM</Typography>
            <Typography variant="subtitle1" fontWeight={700} color={theme.header}>{invoice.from.name}</Typography>
            <Typography variant="body2" color="text.secondary">{invoice.from.address}<br/>{invoice.from.email}<br/>{invoice.from.mobile}</Typography>
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary">BILLED TO</Typography>
            <Typography variant="subtitle1" fontWeight={700} color={theme.header}>{invoice.to.name}</Typography>
            <Typography variant="body2" color="text.secondary">{invoice.to.address}<br/>{invoice.to.email}<br/>{invoice.to.mobile}</Typography>
            <Box sx={{ mt: 2, display: "flex", gap: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="caption" sx={{ textTransform: "uppercase", color: "text.secondary", mb: 0.5 }}>INVOICE DATE</Typography>
                {isEditing ? (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <div className="datePickr">
                      <DatePicker value={editInvoiceDate?new Date(editInvoiceDate):null} onChange={(v)=>setEditInvoiceDate(v?v.toISOString().slice(0,10):null)} slotProps={{ textField: { size:"small", sx:{ width:175, fontSize: "small" } } }} />
                    </div>
                  </LocalizationProvider>
                ) : <Typography variant="body2" fontWeight={500}>{localInvoiceDate}</Typography>}
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="caption" sx={{ textTransform: "uppercase", color: "text.secondary", mb: 0.5 }}>DUE DATE</Typography>
                {isEditing ? (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <div className="datePickr">
                      <DatePicker value={editDueDate?new Date(editDueDate):null} onChange={(v)=>setEditDueDate(v?v.toISOString().slice(0,10):null)} slotProps={{ textField: { size:"small", sx:{ width:175, fontSize: "small" } } }} />
                    </div>
                  </LocalizationProvider>
                ) : <Typography variant="body2" fontWeight={500}>{localDueDate}</Typography>}
              </Box>
            </Box>
          </Box>
        </CardContent>

        {/* Table Header */}
        <Box sx={{ px: 3, py: 1.5, borderBottom: "2px solid rgba(148,163,184,0.3)", backgroundColor: "rgba(243,244,246,0.8)", display: "grid", gridTemplateColumns: ITEM_GRID_TEMPLATE, fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: theme.header }}>
          <GridCell />
          <GridCell />
          <GridCell>Description</GridCell>
          <GridCell />
          <GridCell align="center">Rate Mode</GridCell>
          <GridCell align="center">Duration</GridCell>
          <GridCell align="center">Rate</GridCell>
          <GridCell align="center">Currency</GridCell>
          <GridCell align="right">Total</GridCell>
          <GridCell />
        </Box>

        {/* Items */}
        <Box>
          {localInvoiceItems.map((item, idx) => (
            <React.Fragment key={item.id}>
              {renderInvoiceItem(item, idx)}
              {renderExpenseRows(idx)}
            </React.Fragment>
          ))}
        </Box>

        {/* Footer / Totals */}
        <Box sx={{ px: 3, py: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start", backgroundColor: "white" }}>
          
          {/* Notice Section */}
          <Box sx={{ 
            maxWidth: 400, 
            p: 2, 
            borderRadius: 2, 
            border: "1px dashed #3b82f6", 
            bgcolor: "#eff6ff",
            display: "flex", 
            flexDirection: "column", 
            gap: 0.5 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e40af" }}>Notice</Typography>
            <Typography variant="caption" sx={{ color: "#1e3a8a" }}>
              A finance charge of 1.5% will be made on unpaid balances after 30 days.
            </Typography>
          </Box>
          
          <Box sx={{ width: 300 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography fontWeight={600}>{(grandTotal - taxAmount).toLocaleString(undefined, {minimumFractionDigits:2})}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center" }}>
              <Typography color="text.secondary">Tax %</Typography>
              {isEditing ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <NumberInput value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value))} sx={{ width: 50, mr: 1 }} />
                </Box>
              ) : <Typography>{taxPercent}</Typography>}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography color="text.secondary">Tax Amount</Typography>
              <Typography>{taxAmount.toLocaleString(undefined, {minimumFractionDigits:2})}</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: theme.accent+"15", p: 1.5, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} color={theme.header}>Grand Total</Typography>
              <Typography variant="h6" fontWeight={700} color={theme.accent}>{grandTotal.toLocaleString(undefined, {minimumFractionDigits:2})}</Typography>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
