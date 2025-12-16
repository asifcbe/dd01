// InvoiceTemplate.jsx - Global Edit Mode + Inline Expense Editing + Description Below Label
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
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const COLORTHEMES = [
  {
    name: "Professional Blue",
    accent: "#2563eb",
    header: "#1e293b",
    bg: "#f8fafc",
    notice: "#dbeafe",
    secondary: "#64748b",
  },
  {
    name: "Elegant Purple",
    accent: "#7c3aed",
    header: "#1e1b4b",
    bg: "#faf5ff",
    notice: "#ede9fe",
    secondary: "#7c3aed",
  },
  {
    name: "Modern Green",
    accent: "#059669",
    header: "#064e3b",
    bg: "#f0fdf4",
    notice: "#d1fae5",
    secondary: "#10b981",
  },
  {
    name: "Warm Orange",
    accent: "#ea580c",
    header: "#9a3412",
    bg: "#fff7ed",
    notice: "#fed7aa",
    secondary: "#f97316",
  },
];

function formatDateToISO(dateStr) {
  if (!dateStr) return "";
  const [day, monthStr, year] = dateStr.replace(/,/g, "").split(" ");
  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  return `${year}-${months[monthStr]}-${day.padStart(2, "0")}`;
}

function formatISOToDisplay(dateISO) {
  if (!dateISO) return "";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [year, month, day] = dateISO.split("-");
  return `${parseInt(day, 10)}, ${months[parseInt(month, 10) - 1]} ${year}`;
}

const ITEM_COLUMNS = "56px 2.4fr 1.2fr 1fr 1.1fr 0.9fr 1.2fr 56px";

export default function InvoiceTemplate({
  invoice = {
    invoiceId: "INV-1",
    from: {
      name: "Yahoo Finance",
      mobile: "7845945950",
      email: "yahoo@outlook.com",
      address: "California",
    },
    to: {
      name: "Reed Ireland",
      mobile: "7845945951",
      email: "reedIreland@gmail.com",
      address: "Dublin",
    },
    invoicedate: "20, Nov 2025",
    duedate: "20, Dec 2025",
    invoiceitems: [
      {
        id: 1,
        name: "Dinesh, Madurai, Tamil Nadu",
        duration: 0,
        ratemode: "Daily",
        rateamount: 30000,
        currency: "INR",
        total: 0,
      },
      {
        id: 2,
        name: "Palanisamy, Salem, Tamil Nadu",
        duration: 0,
        ratemode: "Monthly",
        rateamount: 20000,
        currency: "INR",
        total: 0,
      },
      {
        id: 3,
        name: "Macron, Paris",
        duration: 0,
        ratemode: "Monthly",
        rateamount: 20000,
        currency: "INR",
        total: 0,
      },
    ],
    subtotal: 100000,
    tax: 10000,
    total: 110000,
    notice: "A finance charge of 1.5% will be made on unpaid balances after 30 days.",
  },
  template = { name: "Invoice" },
}) {
  const componentRef = useRef(null);
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = COLORTHEMES[themeIdx];
  const [isEditing, setIsEditing] = useState(false);
  const [editInvoiceDate, setEditInvoiceDate] = useState(
    formatDateToISO(invoice.invoicedate)
  );
  const [editDueDate, setEditDueDate] = useState(
    formatDateToISO(invoice.duedate)
  );
  const [localInvoiceDate, setLocalInvoiceDate] = useState(invoice.invoicedate);
  const [localDueDate, setLocalDueDate] = useState(invoice.duedate);
  const [localInvoiceItems, setLocalInvoiceItems] = useState(
    invoice.invoiceitems
  );
  const [savedExpenses, setSavedExpenses] = useState(
    localInvoiceItems.map(() => [])
  );
  const [additionalExpenses, setAdditionalExpenses] = useState(
    localInvoiceItems.map(() => [
      {
        label: "",
        amount: "",
        duration: 0,
        currency: "INR",
        description: "",
      },
    ])
  );
  const [expandedItems, setExpandedItems] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [taxPercent, setTaxPercent] = useState(
    (invoice.tax / invoice.subtotal) * 100 || 10
  );
  const [taxAmount, setTaxAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    let subtotalCalc = 0;
    localInvoiceItems.forEach((item, i) => {
      const expenseTotal = savedExpenses[i].reduce((sum, exp) => {
        const amount = Number(exp.amount) || 0;
        return (
          sum +
          (exp.duration && exp.duration > 0 ? amount * exp.duration : amount)
        );
      }, 0);
      const lastExpense =
        additionalExpenses[i][additionalExpenses[i].length - 1];
      let lastExpenseAmount = 0;
      if (
        lastExpense &&
        (lastExpense.label.trim() !== "" || lastExpense.amount !== "")
      ) {
        lastExpenseAmount = Number(lastExpense.amount) || 0;
      }
      const baseTotal =
        item.duration && item.duration > 0
          ? item.rateamount * item.duration
          : item.rateamount;
      subtotalCalc += baseTotal + expenseTotal + lastExpenseAmount;
    });
    const tax = (subtotalCalc * taxPercent) / 100;
    setTaxAmount(tax);
    setGrandTotal(subtotalCalc + tax);
  }, [taxPercent, localInvoiceItems, savedExpenses, additionalExpenses]);

  const toggleDescription = (idx, eIdx) => {
    const key = `${idx}-${eIdx}`;
    setExpandedDescriptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddExpenseClick = (idx) => {
    if (!isEditing) return;
    const expenses = additionalExpenses[idx];
    const lastExpense = expenses[expenses.length - 1];
    if (lastExpense.label.trim() === "" && lastExpense.amount === "") {
      return;
    }
    const newSavedExpenses = [...savedExpenses];
    newSavedExpenses[idx] = [...newSavedExpenses[idx], { ...lastExpense }];
    setSavedExpenses(newSavedExpenses);

    const newAdditionalExpenses = [...additionalExpenses];
    newAdditionalExpenses[idx] = [
      ...expenses,
      {
        label: "",
        amount: "",
        duration: 0,
        currency: localInvoiceItems[idx].currency,
        description: "",
      },
    ];
    setAdditionalExpenses(newAdditionalExpenses);
  };

  const handleExpenseChange = (rowIdx, expenseIdx, key, value) => {
    if (!isEditing) return;
    const newAdditionalExpenses = [...additionalExpenses];
    newAdditionalExpenses[rowIdx][expenseIdx] = {
      ...newAdditionalExpenses[rowIdx][expenseIdx],
      [key]: value,
    };
    setAdditionalExpenses(newAdditionalExpenses);
  };

  const handleSavedExpenseChange = (rowIdx, expenseIdx, key, value) => {
    if (!isEditing) return;
    const newSavedExpenses = [...savedExpenses];
    newSavedExpenses[rowIdx][expenseIdx] = {
      ...newSavedExpenses[rowIdx][expenseIdx],
      [key]: value,
    };
    setSavedExpenses(newSavedExpenses);
  };

  const handleRemoveExpense = (mainIdx, expIdx) => {
    if (!isEditing) return;
    if (expIdx < savedExpenses[mainIdx].length) {
      const newSavedExpenses = [...savedExpenses];
      newSavedExpenses[mainIdx] = newSavedExpenses[mainIdx].filter(
        (_, i) => i !== expIdx
      );
      setSavedExpenses(newSavedExpenses);
      const key = `${mainIdx}-${expIdx}`;
      const newExpanded = { ...expandedDescriptions };
      delete newExpanded[key];
      setExpandedDescriptions(newExpanded);
    } else {
      const addExpIdx = expIdx - savedExpenses[mainIdx].length;
      const newAdditionalExpenses = [...additionalExpenses];
      newAdditionalExpenses[mainIdx] = newAdditionalExpenses[mainIdx].filter(
        (_, i) => i !== addExpIdx
      );
      setAdditionalExpenses(newAdditionalExpenses);
    }
  };

  const handleDurationChange = (idx, value) => {
    if (!isEditing) return;
    setLocalInvoiceItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, duration: value } : item
      )
    );
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditInvoiceDate(formatDateToISO(localInvoiceDate));
      setEditDueDate(formatDateToISO(localDueDate));
    }
    setIsEditing((prev) => !prev);
  };

  const handleSave = () => {
    setLocalInvoiceDate(formatISOToDisplay(editInvoiceDate));
    setLocalDueDate(formatISOToDisplay(editDueDate));
    setIsEditing(false);
  };

  const toggleItemExpansion = (idx) => {
    setExpandedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleTaxPercentChange = (e) => {
    const val = e.target.value;
    setTaxPercent(val === "" ? 0 : Number(val));
  };

  const handlePrint = () => {
    const printContents = componentRef.current?.innerHTML;
    if (!printContents) return;
    const printWindow = window.open("", "", "width=900,height=650");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceId}</title>
          <style>
            body { margin: 0; padding: 24px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f5f7fb; }
            .print-card { max-width: 1160px; margin: 0 auto; }
            @media print { body { background-color: white; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="print-card">${printContents}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportPDF = handlePrint;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #e5edff 0%, #f8fafc 40%, #f4f4f5 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 5,
        px: 2,
      }}
    >
      <Card
        ref={componentRef}
        sx={{
          width: "100%",
          maxWidth: 1160,
          borderRadius: 3,
          boxShadow: "0 22px 60px rgba(15,23,42,0.16)",
          border: "1px solid rgba(148,163,184,0.25)",
          overflow: "hidden",
          backgroundColor: "white",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 1.75,
            borderBottom: "1px solid rgba(148,163,184,0.3)",
            background: `linear-gradient(90deg, ${theme.accent}12, white)`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.header }}>
              {template?.name || "Invoice"}
            </Typography>
            <Chip
              size="small"
              label={invoice.invoiceId}
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 500,
                color: theme.accent,
                backgroundColor: `${theme.accent}1A`,
                borderRadius: 999,
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Theme</InputLabel>
              <Select
                label="Theme"
                value={themeIdx}
                onChange={(e) => setThemeIdx(e.target.value)}
                size="small"
              >
                {COLORTHEMES.map((t, index) => (
                  <MenuItem key={t.name} value={index}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              size="small"
              sx={{
                borderRadius: 2,
                bgcolor: isEditing ? theme.accent : "transparent",
                color: isEditing ? "white" : "#64748b",
                "&:hover": {
                  bgcolor: isEditing ? `${theme.accent}E6` : "#e5e7eb",
                },
              }}
              onClick={isEditing ? handleSave : handleEditToggle}
            >
              {isEditing ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
            </IconButton>
            <IconButton size="small" color="primary" onClick={handleExportPDF}>
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="primary" onClick={handlePrint}>
              <PrintIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* From/To/Dates - ULTRA SMALL DATE PICKERS */}
        <CardContent
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 1.1fr" },
            gap: 3,
            px: 3,
            py: 2.5,
            borderBottom: "1px solid rgba(148,163,184,0.2)",
            backgroundColor: theme.bg,
          }}
        >
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="overline" sx={{ color: "#64748b", letterSpacing: 1 }}>
                From
              </Typography>
              <Typography variant="subtitle1" sx={{ color: theme.header, fontWeight: 600 }}>
                {invoice.from.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569" }}>
                {invoice.from.address}
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569" }}>
                {invoice.from.email}
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569" }}>
                {invoice.from.mobile}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="overline" sx={{ color: "#64748b", letterSpacing: 1 }}>
                Billed To
              </Typography>
              <Typography variant="subtitle1" sx={{ color: theme.header, fontWeight: 600 }}>
                {invoice.to.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569" }}>
                {invoice.to.address}
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569" }}>
                {invoice.to.email}
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569" }}>
                {invoice.to.mobile}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase" }}>
                Invoice Date
              </Typography>
              {isEditing ? (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={editInvoiceDate ? new Date(editInvoiceDate) : null}
                    onChange={(newVal) =>
                      setEditInvoiceDate(newVal ? newVal.toISOString().slice(0, 10) : null)
                    }
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          width: 150,
                          ".MuiInputBase-root": { fontSize: 12, height: 32, minHeight: 32 },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              ) : (
                <Typography variant="body2" sx={{ color: "#0f172a" }}>
                  {localInvoiceDate}
                </Typography>
              )}
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase" }}>
                Due Date
              </Typography>
              {isEditing ? (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={editDueDate ? new Date(editDueDate) : null}
                    onChange={(newVal) =>
                      setEditDueDate(newVal ? newVal.toISOString().slice(0, 10) : null)
                    }
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: {
                          width: 150,
                          ".MuiInputBase-root": { fontSize: 12, height: 32, minHeight: 32 },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              ) : (
                <Typography variant="body2" sx={{ color: "#0f172a" }}>
                  {localDueDate}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>

        {/* PERFECTLY ALIGNED TABLE - EXPENSE ROWS MATCH PARENT */}
        <CardContent>
          {/* Table Header */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              borderBottom: "2px solid rgba(148,163,184,0.3)",
              backgroundColor: "rgba(243,244,246,0.8)",
              display: "grid",
              gridTemplateColumns: ITEM_COLUMNS,
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: theme.header,
              alignItems: "center",
            }}
          >
            <Box sx={{ width: "56px" }} />
            <Box />
            <Box>Description</Box>
            <Box sx={{ textAlign: "center" }}>Rate Mode</Box>
            <Box sx={{ textAlign: "right" }}>Duration</Box>
            <Box sx={{ textAlign: "right" }}>Rate</Box>
            <Box sx={{ textAlign: "center" }}>Currency</Box>
            <Box sx={{ textAlign: "right" }}>Total</Box>
            <Box />
          </Box>

          {/* Items + Expenses */}
          <Box>
            {localInvoiceItems.map((item, idx) => {
              const baseTotal =
                item.duration && item.duration > 0
                  ? item.rateamount * item.duration
                  : item.rateamount;
              const expenseTotal = savedExpenses[idx].reduce((sum, exp) => {
                const amount = Number(exp.amount) || 0;
                return (
                  sum +
                  (exp.duration && exp.duration > 0 ? amount * exp.duration : amount)
                );
              }, 0);
              const lastExpense =
                additionalExpenses[idx][additionalExpenses[idx].length - 1];
              const lastExpenseAmount =
                lastExpense &&
                (lastExpense.label.trim() !== "" || lastExpense.amount !== "")
                  ? Number(lastExpense.amount) || 0
                  : 0;
              const rowTotal = baseTotal + expenseTotal + lastExpenseAmount;

              return (
                <React.Fragment key={item.id}>
                  {/* Main Item Row */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: ITEM_COLUMNS,
                      alignItems: "center",
                      px: 3,
                      py: 2,
                      fontSize: 13.5,
                      color: "text.primary",
                      borderBottom:
                        idx < localInvoiceItems.length - 1
                          ? "1px solid rgba(148,163,184,0.15)"
                          : "none",
                      backgroundColor:
                        idx % 2 === 0
                          ? "white"
                          : "rgba(248,250,252,0.6)",
                      "&:hover": { backgroundColor: "rgba(236,246,255,0.4)" },
                    }}
                  >
                    <Box sx={{ color: theme.secondary, fontWeight: 600 }}>
                      {String(idx + 1).padStart(2, "0")}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, mb: 0.25 }}>
                        {item.name}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center", fontWeight: 500 }}>
                      {item.ratemode}
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      {isEditing ? (
                        <TextField
                          type="number"
                          size="small"
                          value={item.duration}
                          onChange={(e) =>
                            handleDurationChange(idx, Number(e.target.value) || 0)
                          }
                          sx={{
                            width: 60,
                            ".MuiInputBase-root": {
                              fontSize: 12,
                              height: 32,
                              minHeight: 32,
                            },
                          }}
                        />
                      ) : (
                        item.duration || "-"
                      )}
                    </Box>
                    <Box sx={{ textAlign: "right", fontWeight: 600 }}>
                      {item.rateamount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Box>
                    <Box sx={{ textAlign: "center", fontWeight: 500 }}>
                      {item.currency}
                    </Box>
                    <Box
                      sx={{
                        textAlign: "right",
                        fontWeight: 700,
                        color: theme.accent,
                        fontSize: 14,
                      }}
                    >
                      {rowTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleItemExpansion(idx)}
                        sx={{ color: theme.secondary }}
                      >
                        {expandedItems[idx] ? (
                          <ExpandLessIcon fontSize="small" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Elegant Expenses Section - GLOBAL EDIT MODE */}
                  <Collapse in={!!expandedItems[idx]} timeout="auto" unmountOnExit>
                    <Box
                      sx={{
                        px: 3,
                        pb: 2,
                        backgroundColor: "rgba(248,250,252,0.4)",
                        borderBottom: "1px solid rgba(148,163,184,0.2)",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1.5,
                          color: theme.header,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <DescriptionIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Additional Expenses
                      </Typography>

                      {/* Saved Expenses - ALL FIELDS EDITABLE IN GLOBAL MODE */}
                      {savedExpenses[idx].map((exp, eIdx) => {
                        const amount = Number(exp.amount) || 0;
                        const expTotal =
                          exp.duration && exp.duration > 0
                            ? amount * exp.duration
                            : amount;
                        const expKey = `${idx}-${eIdx}`;

                        return (
                          <Box
                            key={expKey}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: ITEM_COLUMNS,
                              alignItems: "start",
                              px: 3,
                              py: 1.25,
                              mb: 0.5,
                              backgroundColor: isEditing ? "rgba(236,246,255,0.4)" : "white",
                              borderBottom: "1px solid rgba(148,163,184,0.08)",
                            }}
                          >
                            <Box />
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                              {/* Label Field/Chip */}
                              {isEditing ? (
                                <TextField
                                  size="small"
                                  placeholder="Label"
                                  value={exp.label || ""}
                                  onChange={(e) =>
                                    handleSavedExpenseChange(idx, eIdx, "label", e.target.value)
                                  }
                                  sx={{
                                    ".MuiInputBase-root": {
                                      fontSize: 12,
                                      height: 32,
                                      minHeight: 32,
                                    },
                                    borderRadius: 1,
                                  }}
                                />
                              ) : (
                                <Chip
                                  size="small"
                                  label={exp.label || "Unnamed Expense"}
                                  sx={{
                                    height: 20,
                                    fontSize: 10,
                                    fontWeight: 500,
                                    backgroundColor: "rgba(99,102,241,0.1)",
                                    color: "#6366f1",
                                  }}
                                />
                              )}
                              
                              {/* Description Field - BELOW LABEL */}
                              {isEditing && (
                                <TextField
                                  size="small"
                                  placeholder="Description"
                                  multiline
                                  rows={1}
                                  value={exp.description || ""}
                                  onChange={(e) =>
                                    handleSavedExpenseChange(idx, eIdx, "description", e.target.value)
                                  }
                                  sx={{
                                    ".MuiInputBase-root": {
                                      fontSize: 11,
                                      height: 28,
                                      minHeight: 28,
                                    },
                                    borderRadius: 1,
                                  }}
                                />
                              )}
                              
                              <IconButton
                                size="small"
                                onClick={() => toggleDescription(idx, eIdx)}
                                sx={{ p: 0.25, alignSelf: "flex-start" }}
                              >
                                {expandedDescriptions[expKey] ? (
                                  <ExpandLessIcon fontSize="small" />
                                ) : (
                                  <DescriptionIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Box>
                            <Box sx={{ textAlign: "center" }}>-</Box>
                            <Box sx={{ textAlign: "right" }}>
                              {isEditing ? (
                                <TextField
                                  type="number"
                                  size="small"
                                  value={exp.duration ?? 0}
                                  onChange={(e) =>
                                    handleSavedExpenseChange(
                                      idx,
                                      eIdx,
                                      "duration",
                                      Number(e.target.value) || 0
                                    )
                                  }
                                  sx={{
                                    width: 60,
                                    ".MuiInputBase-root": {
                                      fontSize: 12,
                                      height: 32,
                                      minHeight: 32,
                                    },
                                  }}
                                />
                              ) : (
                                exp.duration ?? "-"
                              )}
                            </Box>
                            <Box sx={{ textAlign: "right", fontWeight: 600 }}>
                              {isEditing ? (
                                <TextField
                                  type="number"
                                  size="small"
                                  value={exp.amount || ""}
                                  onChange={(e) =>
                                    handleSavedExpenseChange(
                                      idx,
                                      eIdx,
                                      "amount",
                                      Number(e.target.value) || 0
                                    )
                                  }
                                  sx={{
                                    width: 75,
                                    ".MuiInputBase-root": {
                                      fontSize: 12,
                                      height: 32,
                                      minHeight: 32,
                                    },
                                  }}
                                />
                              ) : (
                                amount.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })
                              )}
                            </Box>
                            <Box sx={{ textAlign: "center" }}>
                              {isEditing ? (
                                <TextField
                                  size="small"
                                  value={exp.currency || ""}
                                  onChange={(e) =>
                                    handleSavedExpenseChange(idx, eIdx, "currency", e.target.value)
                                  }
                                  sx={{
                                    width: 50,
                                    ".MuiInputBase-root": {
                                      fontSize: 12,
                                      height: 32,
                                      minHeight: 32,
                                    },
                                  }}
                                />
                              ) : (
                                exp.currency
                              )}
                            </Box>
                            <Box
                              sx={{
                                textAlign: "right",
                                fontWeight: 600,
                                color: theme.accent,
                              }}
                            >
                              {expTotal.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              {isEditing && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveExpense(idx, eIdx)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                            
                            {/* Description Display (View Mode Only) */}
                            {!isEditing && expandedDescriptions[expKey] && (
                              <Collapse in={true} timeout="auto" sx={{ gridColumn: "1 / -1", mt: 0.75 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: theme.secondary,
                                    fontSize: 12.5,
                                    pl: 2,
                                    py: 1,
                                    backgroundColor: "rgba(248,250,252,0.6)",
                                    borderRadius: 1,
                                  }}
                                >
                                  {exp.description || "No description"}
                                </Typography>
                              </Collapse>
                            )}
                          </Box>
                        );
                      })}

                      {/* Add New Expense Form */}
                      {isEditing && (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: ITEM_COLUMNS,
                            alignItems: "center",
                            px: 3,
                            py: 1.25,
                            mt: 1,
                            backgroundColor: "rgba(236,246,255,0.4)",
                            border: "2px dashed rgba(37,99,235,0.3)",
                            borderRadius: 1,
                          }}
                        >
                          <Box />
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <TextField
                              size="small"
                              placeholder="Label"
                              value={
                                additionalExpenses[idx]?.[additionalExpenses[idx].length - 1]
                                  ?.label || ""
                              }
                              onChange={(e) =>
                                handleExpenseChange(
                                  idx,
                                  additionalExpenses[idx].length - 1,
                                  "label",
                                  e.target.value
                                )
                              }
                              sx={{
                                ".MuiInputBase-root": {
                                  fontSize: 12,
                                  height: 32,
                                  minHeight: 32,
                                },
                                borderRadius: 1,
                              }}
                            />
                            <TextField
                              size="small"
                              placeholder="Description"
                              multiline
                              rows={1}
                              value={
                                additionalExpenses[idx]?.[additionalExpenses[idx].length - 1]
                                  ?.description || ""
                              }
                              onChange={(e) =>
                                handleExpenseChange(
                                  idx,
                                  additionalExpenses[idx].length - 1,
                                  "description",
                                  e.target.value
                                )
                              }
                              sx={{
                                ".MuiInputBase-root": {
                                  fontSize: 11,
                                  height: 28,
                                  minHeight: 28,
                                },
                                borderRadius: 1,
                              }}
                            />
                          </Box>
                          <Box sx={{ textAlign: "center" }}>-</Box>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Dur"
                            value={
                              additionalExpenses[idx]?.[additionalExpenses[idx].length - 1]
                                ?.duration || ""
                            }
                            onChange={(e) =>
                              handleExpenseChange(
                                idx,
                                additionalExpenses[idx].length - 1,
                                "duration",
                                Number(e.target.value) || 0
                              )
                            }
                            sx={{
                              width: 60,
                              ".MuiInputBase-root": {
                                fontSize: 12,
                                height: 32,
                                minHeight: 32,
                              },
                            }}
                          />
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Amt"
                            value={
                              additionalExpenses[idx]?.[additionalExpenses[idx].length - 1]
                                ?.amount || ""
                            }
                            onChange={(e) =>
                              handleExpenseChange(
                                idx,
                                additionalExpenses[idx].length - 1,
                                "amount",
                                Number(e.target.value) || 0
                              )
                            }
                            sx={{
                              width: 75,
                              ".MuiInputBase-root": {
                                fontSize: 12,
                                height: 32,
                                minHeight: 32,
                              },
                            }}
                          />
                          <TextField
                            size="small"
                            placeholder="Cur"
                            value={
                              additionalExpenses[idx]?.[additionalExpenses[idx].length - 1]
                                ?.currency || ""
                            }
                            onChange={(e) =>
                              handleExpenseChange(
                                idx,
                                additionalExpenses[idx].length - 1,
                                "currency",
                                e.target.value
                              )
                            }
                            sx={{
                              width: 50,
                              ".MuiInputBase-root": {
                                fontSize: 12,
                                height: 32,
                                minHeight: 32,
                              },
                            }}
                          />
                          <Box sx={{ textAlign: "right" }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<AddIcon fontSize="small" />}
                              onClick={() => handleAddExpenseClick(idx)}
                              sx={{
                                minWidth: 65,
                                fontSize: 12,
                                borderColor: theme.accent,
                                color: theme.accent,
                                "&:hover": {
                                  borderColor: theme.accent,
                                  backgroundColor: `${theme.accent}12`,
                                },
                              }}
                            >
                              Add
                            </Button>
                          </Box>
                          <Box />
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </React.Fragment>
              );
            })}
          </Box>
        </CardContent>

        {/* Totals + Notice */}
        <CardContent>
          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.6fr 0.9fr" },
              gap: 3,
              alignItems: "flex-start",
              backgroundColor: "white",
            }}
          >
            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: theme.notice, border: `1px dashed ${theme.accent}66` }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, color: theme.header }}>
                Notice
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569" }}>
                {invoice.notice}
              </Typography>
            </Box>
            <Box sx={{ ml: "md-auto", maxWidth: 320 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, fontSize: 14 }}>
                <Typography sx={{ color: "#64748b" }}>Subtotal</Typography>
                <Typography sx={{ textAlign: "right" }}>
                  {(grandTotal - taxAmount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center", fontSize: 14 }}>
                <Typography sx={{ color: "#64748b" }}>Tax</Typography>
                {isEditing ? (
                  <TextField
                    size="small"
                    type="number"
                    value={taxPercent}
                    onChange={handleTaxPercentChange}
                    sx={{
                      width: 65,
                      ".MuiInputBase-root": { fontSize: 12, height: 32, minHeight: 32 },
                    }}
                  />
                ) : (
                  <Typography>{taxPercent}%</Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, fontSize: 14 }}>
                <Typography sx={{ color: "#64748b" }}>Tax Amount</Typography>
                <Typography sx={{ textAlign: "right" }}>
                  {taxAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: `${theme.accent}10`,
                  borderRadius: 999,
                  px: 1.75,
                  py: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.header }}>
                  Grand Total
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: theme.accent }}
                >
                  {grandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
