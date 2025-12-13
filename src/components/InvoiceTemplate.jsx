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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
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
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

const options = ["Option 1", "Option 2", "Option 3"];
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
    notice:
      "A finance charge of 1.5% will be made on unpaid balances after 30 days.",
  },
  onExportPDF,
  onPrint,
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

  const [additionalExpenses, setAdditionalExpenses] = useState(() =>
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

  const [taxPercent, setTaxPercent] = useState(10);
  const [taxAmount, setTaxAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  useEffect(() => {
    let subtotalCalc = 0;
    localInvoiceItems.forEach((item, i) => {
      const expenseTotal = savedExpenses[i].reduce(
        (sum, exp) => sum + (Number(exp.amount) || 0),
        0
      );
      const lastExpense =
        additionalExpenses[i][additionalExpenses[i].length - 1];
      let lastExpenseAmount = 0;
      if (
        lastExpense &&
        (lastExpense.label.trim() !== "" || lastExpense.amount !== "")
      ) {
        lastExpenseAmount = Number(lastExpense.amount) || 0;
      }
      subtotalCalc +=
        (item.duration && item.duration > 0
          ? item.rateamount * item.duration
          : item.rateamount) +
        expenseTotal +
        lastExpenseAmount;
    });
    setTaxAmount((subtotalCalc * taxPercent) / 100);
    setGrandTotal(subtotalCalc + (subtotalCalc * taxPercent) / 100);
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
    setLocalInvoiceItems(
      localInvoiceItems.map((item, i) =>
        i === idx ? { ...item, duration: value } : item
      )
    );
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditInvoiceDate(formatDateToISO(localInvoiceDate));
      setEditDueDate(formatDateToISO(localDueDate));
      setTaxPercent((invoice.tax / invoice.subtotal) * 100 || 10);
    }
    setIsEditing(!isEditing);
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

  const handlePrint = () => {
    const printContent = componentRef.current.cloneNode(true);
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write("<html><head><title>Invoice</title>");
    printWindow.document.write("<style>");
    printWindow.document.write(`
      * { margin: 0; padding: 0; box-sizing: border-box;}
      body { margin: 20px; font-family: 'Segoe UI', Roboto, Arial, sans-serif; background: white; color: ${theme.header};}
      .invoice-container {
        max-width: 950px; margin: 0 auto; background: ${theme.bg};
        border-radius: 14px; box-shadow: 0 2px 18px rgba(0,0,0,0.07);
        padding: 32px 28px 18px 28px; color: ${theme.header};
      }
      table {
        width: 100%; border-collapse: collapse;
        font-size: 15px; background: #fff;
      }
      th, td {
        padding: 11px 8px;
        border-bottom: 1px solid #e0e6ed;
      }
      th {
        background: ${theme.notice}; color: ${theme.header};
        font-weight: 700; text-align: left;
      }
      .description-box {
        background: #f9f9f9;
        border-left: 3px solid ${theme.accent};
        padding: 8px 12px;
        margin: 4px 0;
        font-size: 14px;
        color: #555;
      }
      @media print {
        body {margin: 0;}
        .invoice-container {box-shadow: none;}
      }
    `);
    printWindow.document.write("</style></head><body>");
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleExportPDF = async () => {
    if (typeof window.html2pdf === "undefined") {
      alert(
        'Please include html2pdf.js library. Add this to your HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>'
      );
      handlePrint();
      return;
    }
    const element = componentRef.current;
    const opt = {
      margin: 10,
      filename: `invoice-${invoice.invoiceId}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    try {
      await window.html2pdf().set(opt).from(element).save();
    } catch {
      handlePrint();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 3 }}
          className="no-print"
        >
          {template.name}
        </Typography>
        <div
          style={{
            background: theme.bg,
            minHeight: "100vh",
            fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
            color: theme.header,
          }}
        >
          {/* Theme Picker */}
          <Box
            className="no-print"
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 3,
              px: 2,
            }}
          >
            <Typography variant="body1" sx={{ mr: 2, fontWeight: 500 }}>
              Choose Theme:
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {COLORTHEMES.map((t, idx) => (
                <Chip
                  key={t.name}
                  label={t.name}
                  onClick={() => setThemeIdx(idx)}
                  sx={{
                    backgroundColor: idx === themeIdx ? t.accent : "transparent",
                    color: idx === themeIdx ? "white" : t.accent,
                    border: `1px solid ${t.accent}`,
                    "&:hover": {
                      backgroundColor: idx === themeIdx ? t.accent : t.notice,
                    },
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Toolbar */}
          <Box
            className="no-print"
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mb: 3,
              px: 2,
            }}
          >
            <Button
              variant="contained"
              startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
              onClick={isEditing ? handleSave : handleEditToggle}
              sx={{
                backgroundColor: theme.accent,
                "&:hover": { backgroundColor: theme.secondary },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {isEditing ? "Save Changes" : "Edit Invoice"}
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdfIcon />}
              onClick={handleExportPDF}
              sx={{
                backgroundColor: "#dc2626",
                "&:hover": { backgroundColor: "#b91c1c" },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Export PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{
                backgroundColor: "#374151",
                "&:hover": { backgroundColor: "#1f2937" },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Print
            </Button>
          </Box>

          {/* Main container */}
          <Card
            ref={componentRef}
            className="invoice-container"
            elevation={3}
            sx={{
              maxWidth: 1000,
              mx: "auto",
              background: theme.bg,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 3,
                pb: 2,
                borderBottom: `2px solid ${theme.secondary}20`,
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: theme.accent,
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  {invoice.to.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {invoice.to.mobile}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {invoice.to.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {invoice.to.address}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  variant="h3"
                  sx={{
                    color: theme.accent,
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  {invoice.invoiceId}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.secondary }}>
                    Invoice Date:
                  </Typography>
                  {isEditing ? (
                    <DatePicker
                      value={editInvoiceDate ? new Date(editInvoiceDate) : null}
                      onChange={(newValue) =>
                        setEditInvoiceDate(
                          newValue ? newValue.toISOString().slice(0, 10) : ""
                        )
                      }
                      slotProps={{
                        textField: { size: "small", sx: { width: 150, mt: 0.5 } },
                      }}
                      inputFormat="dd, MMM yyyy"
                    />
                  ) : (
                    <Typography variant="body1">{localInvoiceDate}</Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.secondary }}>
                    Due Date:
                  </Typography>
                  {isEditing ? (
                    <DatePicker
                      value={editDueDate ? new Date(editDueDate) : null}
                      onChange={(newValue) =>
                        setEditDueDate(
                          newValue ? newValue.toISOString().slice(0, 10) : ""
                        )
                      }
                      slotProps={{
                        textField: { size: "small", sx: { width: 150, mt: 0.5 } },
                      }}
                      inputFormat="dd, MMM yyyy"
                    />
                  ) : (
                    <Typography variant="body1">{localDueDate}</Typography>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Invoice To */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="overline"
                sx={{
                  color: theme.secondary,
                  fontWeight: 600,
                  letterSpacing: 1,
                  mb: 1,
                }}
              >
                BILL TO
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {invoice.from.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {invoice.from.mobile}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {invoice.from.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {invoice.from.address}
              </Typography>
            </Box>

            {/* Invoice Table */}
            <Box
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${theme.secondary}20`,
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                mb: 3,
              }}
            >
              <table
                id="invoicetable"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                  background: "#fff",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: theme.notice,
                      color: theme.header,
                      fontSize: 14,
                    }}
                  >
                    <th style={{ fontWeight: 700, padding: "16px 12px", textAlign: "left" }}>#</th>
                    <th style={{ fontWeight: 700, padding: "16px 12px", textAlign: "left" }}>
                      Description
                    </th>
                    <th style={{ fontWeight: 700, padding: "16px 12px", textAlign: "left" }}>
                      Rate Mode
                    </th>
                    <th style={{ fontWeight: 700, padding: "16px 12px", textAlign: "left" }}>
                      Duration
                    </th>
                    <th style={{ fontWeight: 700, padding: "16px 12px", textAlign: "left" }}>
                      Rate Amount
                    </th>
                    <th style={{ fontWeight: 700, padding: "16px 12px", textAlign: "left" }}>
                      Currency
                    </th>
                    <th
                      style={{
                        fontWeight: 700,
                        padding: "16px 12px",
                        textAlign: "right",
                      }}
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {localInvoiceItems.map((item, idx) => {
                    const parentBg = idx % 2 === 0 ? "#fff" : theme.notice;
                    const savedCount = savedExpenses[idx]?.length || 0;
                    const hasChildren =
                      savedCount > 0 ||
                      (isEditing && additionalExpenses[idx].length > 0);

                    return (
                      <React.Fragment key={item.id}>
                        {/* Parent row */}
                        <tr
                          style={{
                            background: parentBg,
                            minHeight: 70,
                            borderBottom: hasChildren
                              ? "none"
                              : "1px solid #e0e6ed",
                          }}
                        >
                          <td
                            style={{
                              background: theme.accent,
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: 18,
                              textAlign: "center",
                              minWidth: 44,
                              verticalAlign: "middle",
                              lineHeight: "70px",
                              borderRadius: 0,
                            }}
                          >
                            {String(idx + 1).padStart(2, "0")}
                          </td>
                          <td
                            style={{
                              verticalAlign: "middle",
                              padding: "11px 8px",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {item.name}
                              {hasChildren && (
                                <IconButton size="small" sx={{ p: 0 }} onClick={() => toggleItemExpansion(idx)}>
                                  {expandedItems[idx] ? (
                                    <ExpandLessIcon sx={{ color: theme.secondary }} />
                                  ) : (
                                    <ExpandMoreIcon sx={{ color: theme.secondary }} />
                                  )}
                                </IconButton>
                              )}
                            </Box>
                          </td>
                          <td
                            style={{
                              verticalAlign: "middle",
                              padding: "11px 8px",
                            }}
                          >
                            {item.ratemode}
                          </td>
                          <td
                            style={{
                              verticalAlign: "middle",
                              padding: "11px 8px",
                            }}
                          >
                            {isEditing ? (
                              <input
                                type="number"
                                min="1"
                                value={item.duration}
                                onChange={(e) =>
                                  handleDurationChange(
                                    idx,
                                    Number(e.target.value)
                                  )
                                }
                                style={{
                                  width: 60,
                                  borderRadius: 5,
                                  border: "1px solid #ccc",
                                  paddingLeft: 8,
                                }}
                              />
                            ) : (
                              item.duration
                            )}
                          </td>
                          <td
                            style={{
                              verticalAlign: "middle",
                              padding: "11px 8px",
                            }}
                          >
                            {item.rateamount}
                          </td>
                          <td
                            style={{
                              verticalAlign: "middle",
                              padding: "11px 8px",
                            }}
                          >
                            {item.currency}
                          </td>
                          <td
                            style={{
                              color: theme.accent,
                              fontWeight: "bold",
                              textAlign: "center",
                              minWidth: 48,
                              borderRadius: "0 5px 5px 0",
                              position: "relative",
                              verticalAlign: "middle",
                              padding: "11px 8px",
                            }}
                          >
                            {(item.duration && item.duration > 0
                              ? item.rateamount * item.duration
                              : item.rateamount
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>

                        {/* Saved child expenses rows */}
                        {savedExpenses[idx] && expandedItems[idx] &&
                          savedExpenses[idx].map((exp, eIdx) => {
                            const isLastSaved =
                              eIdx === savedExpenses[idx].length - 1;
                            const isLastChildRow =
                              isLastSaved &&
                              (!isEditing ||
                                additionalExpenses[idx].length === 0);
                            const descriptionKey = `${idx}-${eIdx}`;
                            const isDescriptionExpanded =
                              expandedDescriptions[descriptionKey];

                            return (
                              <React.Fragment
                                key={`saved-exp-${idx}-${eIdx}`}
                              >
                                <tr
                                  style={{
                                    background: parentBg,
                                    borderBottom:
                                      isLastChildRow && !isDescriptionExpanded
                                        ? "1px solid #e0e6ed"
                                        : "none",
                                  }}
                                >
                                  <td
                                    style={{
                                      background: theme.accent,
                                      borderBottom: "none",
                                    }}
                                  />
                                  <td
                                    style={{
                                      fontStyle: !isEditing
                                        ? "italic"
                                        : "normal",
                                      color: !isEditing ? "#555" : "#000",
                                      verticalAlign: "middle",
                                      padding: "11px 8px",
                                      textAlign: "left",
                                    }}
                                  >
                                    {!isEditing ? (
                                      <>
                                        {exp.label}
                                        {exp.description && (
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              toggleDescription(idx, eIdx)
                                            }
                                            sx={{ padding: 0, ml: 1 }}
                                          >
                                            {isDescriptionExpanded ? (
                                              <ExpandLessIcon fontSize="small" />
                                            ) : (
                                              <ExpandMoreIcon fontSize="small" />
                                            )}
                                          </IconButton>
                                        )}
                                      </>
                                    ) : (
                                      <Select
                                        size="small"
                                        value={exp.label}
                                        onChange={(e) =>
                                          handleSavedExpenseChange(
                                            idx,
                                            eIdx,
                                            "label",
                                            e.target.value
                                          )
                                        }
                                        displayEmpty
                                        sx={{ height: "20px", textAlign: "left" }}
                                      >
                                        <MenuItem value="" disabled>
                                          Expense
                                        </MenuItem>
                                        {options.map((option) => (
                                          <MenuItem
                                            key={option}
                                            value={option}
                                          >
                                            {option}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    )}
                                  </td>
                                  <td
                                    style={{
                                      verticalAlign: "middle",
                                      padding: "11px 8px", // CHANGED
                                    }}
                                  >
                                    {localInvoiceItems[idx].ratemode}
                                  </td>
                                  <td
                                    style={{
                                      padding: "11px 8px", // CHANGED
                                      textAlign: "center",
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    {!isEditing ? (
                                      exp.duration ?? 0
                                    ) : (
                                      <input
                                        type="number"
                                        min="1"
                                        value={exp.duration ?? 0}
                                        onChange={(e) =>
                                          handleSavedExpenseChange(
                                            idx,
                                            eIdx,
                                            "duration",
                                            Number(e.target.value)
                                          )
                                        }
                                        style={{
                                          width: 60,
                                          borderRadius: 3,
                                          border: "1px solid #bbb",
                                          padding: 4,
                                        }}
                                      />
                                    )}
                                  </td>
                                  <td
                                    style={{
                                      padding: "11px 8px", // CHANGED
                                      textAlign: "right",
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    {!isEditing ? (
                                      exp.amount
                                    ) : (
                                      <input
                                        type="number"
                                        min="1"
                                        value={exp.amount}
                                        onChange={(e) =>
                                          handleSavedExpenseChange(
                                            idx,
                                            eIdx,
                                            "amount",
                                            Number(e.target.value)
                                          )
                                        }
                                        style={{
                                          width: 90,
                                          borderRadius: 3,
                                          border: "1px solid #bbb",
                                          padding: 4,
                                        }}
                                      />
                                    )}
                                  </td>
                                  <td
                                    style={{
                                      verticalAlign: "middle",
                                      padding: "11px 8px", // CHANGED
                                    }}
                                  >
                                    {exp.currency}
                                  </td>
                                  <td
                                    style={{
                                      fontWeight: "bold",
                                      textAlign: "center", // CHANGED (remove flex)
                                      padding: "11px 8px", // CHANGED
                                      verticalAlign: "middle",
                                    }}
                                  >
                                    {(exp.duration && exp.duration > 0
                                      ? exp.amount * exp.duration
                                      : exp.amount || 0
                                    ).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                    {isEditing && (
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleRemoveExpense(idx, eIdx)
                                        }
                                        sx={{ ml: 1 }} // optional small spacing
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                  </td>
                                </tr>

                                {/* Description row for saved expenses */}
                                {exp.description && (
                                  <tr>
                                    <td
                                      style={{
                                        padding: 0,
                                        borderBottom: isLastChildRow
                                          ? "1px solid #e0e6ed"
                                          : "none",
                                          background: theme.accent
                                      }}
                                    />
                                    <td
                                      colSpan={6}
                                      style={{
                                        padding: 0,
                                        borderBottom: isLastChildRow
                                          ? "1px solid #e0e6ed"
                                          : "none",
                                      }}
                                    >
                                      <Collapse
                                        in={isDescriptionExpanded || isEditing}
                                      >
                                        <div
                                          className="description-box"
                                          style={{
                                            padding: isEditing
                                              ? "8px 12px"
                                              : "8px 12px",
                                            margin: 0,
                                            
                                          }}
                                        >
                                          {isEditing ? (
                                            <TextField
                                              fullWidth
                                              multiline
                                              rows={2}
                                              value={exp.description}
                                              onChange={(e) =>
                                                handleSavedExpenseChange(
                                                  idx,
                                                  eIdx,
                                                  "description",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Add description for this expense..."
                                              variant="outlined"
                                              size="small"
                                              sx={{
                                                '& .MuiOutlinedInput-root': {
                                                  backgroundColor: 'transparent',
                                                  '& fieldset': {
                                                    border: 'none',
                                                  },
                                                  '&:hover fieldset': {
                                                    border: 'none',
                                                  },
                                                  '&.Mui-focused fieldset': {
                                                    border: 'none',
                                                  },
                                                },
                                                '& .MuiInputBase-input::placeholder': {
                                                  color: 'black',
                                                },
                                              }}
                                            />
                                          ) : (
                                            <div
                                              style={{
                                                textAlign: "left",
                                                fontSize: "14px",
                                                marginLeft: 10,
                                                color: "#555",
                                                lineHeight: "1.4",
                                              }}
                                            >
                                              {/* <strong>Description:</strong>{" "} */}
                                              {exp.description}
                                            </div>
                                          )}
                                        </div>
                                      </Collapse>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}

                        {/* Empty editable child expense row */}
                        {isEditing && expandedItems[idx] && (
                          <tr
                            key={`empty-exp-${idx}`}
                            style={{
                              background: parentBg,
                              borderBottom: "1px solid #e0e6ed",
                            }}
                          >
                            <td style={{ background: theme.accent }} />
                            <td style={{ padding: "11px 8px", textAlign: "left" }}>
                              <Select
                                size="small"
                                value={
                                  additionalExpenses[idx][
                                    additionalExpenses[idx].length - 1
                                  ].label
                                }
                                onChange={(e) =>
                                  handleExpenseChange(
                                    idx,
                                    additionalExpenses[idx].length - 1,
                                    "label",
                                    e.target.value
                                  )
                                }
                                displayEmpty
                                sx={{ height: "20px", textAlign: "left" }}
                              >
                                <MenuItem value="" disabled>
                                  Expense
                                </MenuItem>
                                {options.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </td>
                            <td style={{ padding: "11px 8px" }}>
                              <input
                                type="text"
                                value={localInvoiceItems[idx].ratemode}
                                disabled
                                style={{
                                  width: 100,
                                  borderRadius: 3,
                                  border: "1px solid #eee",
                                  backgroundColor: "#f9f9f9",
                                  padding: 4,
                                  color: "#777",
                                }}
                              />
                            </td>
                            <td style={{ padding: "11px 8px" }}>
                              <input
                                type="number"
                                min="1"
                                placeholder="Duration"
                                value={
                                  additionalExpenses[idx][
                                    additionalExpenses[idx].length - 1
                                  ].duration || ""
                                }
                                onChange={(e) =>
                                  handleExpenseChange(
                                    idx,
                                    additionalExpenses[idx].length - 1,
                                    "duration",
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value)
                                  )
                                }
                                style={{
                                  width: 60,
                                  borderRadius: 3,
                                  border: "1px solid #bbb",
                                  padding: 4,
                                }}
                              />
                            </td>
                            <td style={{ padding: "11px 8px" }}>
                              <input
                                type="number"
                                min="1"
                                placeholder="Amount"
                                value={
                                  additionalExpenses[idx][
                                    additionalExpenses[idx].length - 1
                                  ].amount
                                }
                                onChange={(e) =>
                                  handleExpenseChange(
                                    idx,
                                    additionalExpenses[idx].length - 1,
                                    "amount",
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value)
                                  )
                                }
                                style={{
                                  width: 90,
                                  borderRadius: 3,
                                  border: "1px solid #bbb",
                                  padding: 4,
                                }}
                              />
                            </td>
                            <td style={{ padding: "11px 8px" }}>
                              <input
                                type="text"
                                value={
                                  additionalExpenses[idx][
                                    additionalExpenses[idx].length - 1
                                  ].currency
                                }
                                disabled
                                style={{
                                  width: 50,
                                  borderRadius: 3,
                                  border: "1px solid #eee",
                                  backgroundColor: "#f9f9f9",
                                  padding: 4,
                                  color: "#777",
                                }}
                              />
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                padding: "11px 8px",
                              }}
                            >
                              <IconButton
                                onClick={() => handleAddExpenseClick(idx)}
                                title="Add Additional Expense"
                                size="small"
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 0,
                                  fontSize: 20,
                                  fontWeight: "bold",
                                  color: theme.accent,
                                  cursor: "pointer",
                                  userSelect: "none",
                                }}
                              >
                                <AddIcon fontSize="inherit" />
                              </IconButton>
                            </td>
                          </tr>
                        )}

                        {/* Description input for new expense in edit mode */}
                        {isEditing &&
                          expandedItems[idx] &&
                          additionalExpenses[idx] &&
                          additionalExpenses[idx].length > 0 && (
                            <tr>
                              <td style={{ padding: 0, borderBottom: "1px solid #e0e6ed", background: theme.accent }} />
                              <td colSpan={6} style={{ padding: 0, borderBottom: "1px solid #e0e6ed" }}>
                                <div
                                  className="description-box"
                                  style={{
                                    background: parentBg,
                                    padding: "8px 12px",
                                    margin: 0,
                                    // borderLeft: `3px solid ${theme.accent}`,
                                  }}
                                >
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={
                                      additionalExpenses[idx][
                                        additionalExpenses[idx].length - 1
                                      ].description
                                    }
                                    onChange={(e) =>
                                      handleExpenseChange(
                                        idx,
                                        additionalExpenses[idx].length - 1,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Add description for this expense..."
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'transparent',
                                        '& fieldset': {
                                          border: 'none',
                                        },
                                        '&:hover fieldset': {
                                          border: 'none',
                                        },
                                        '&.Mui-focused fieldset': {
                                          border: 'none',
                                        },
                                      },
                                      '& .MuiInputBase-input::placeholder': {
                                        color: 'black',
                                      },
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4}></td>
                    <td
                      colSpan={1}
                      style={{
                        fontWeight: "bold",
                        padding: 12,
                        textAlign: "right",
                      }}
                    >
                      TAX %
                    </td>
                    <td>
                      {isEditing ? (
                        <TextField
                          size="small"
                          type="number"
                          value={taxPercent}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (!isNaN(val) && val >= 0) setTaxPercent(val);
                          }}
                          inputProps={{ min: 0 }}
                          sx={{ width: 90, ml: 0.5 }}
                        />
                      ) : (
                        <span style={{ fontWeight: "bold", padding: 12 }}>
                          {taxPercent.toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td>
                      {taxAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4}></td>
                    <td
                      colSpan={2}
                      style={{
                        color: theme.accent,
                        fontWeight: "bold",
                        padding: 12,
                        textAlign: "right",
                        fontSize: 19,
                      }}
                    >
                      GRAND TOTAL
                    </td>
                    <td
                      style={{
                        color: theme.accent,
                        fontWeight: "bold",
                        padding: 12,
                      }}
                    >
                      {grandTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </Box>

            <Box
              sx={{
                textAlign: "center",
                my: 3,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: theme.accent,
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Thank you!
              </Typography>
              <Box
                sx={{
                  background: theme.notice,
                  borderLeft: `4px solid ${theme.accent}`,
                  p: 2,
                  borderRadius: 1,
                  maxWidth: 700,
                  mx: "auto",
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  <strong>NOTICE:</strong> {invoice.notice}
                </Typography>
              </Box>
            {/* <Divider sx={{ my: 2 }} /> */}
            {/* <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 1 }}
            >
              Invoice was created on a computer and is valid without the signature and seal.
            </Typography> */}
            </Box>
          </CardContent>
        </Card>
        </div>
      </>
    </LocalizationProvider>
  );
}
