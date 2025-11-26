import React, { useState, useRef, useEffect } from "react";
import { Typography, TextField, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Select, MenuItem } from "@mui/material";
const options = ["Option 1", "Option 2", "Option 3"];
const COLORTHEMES = [
  {
    name: "Blue",
    accent: "#1976d2",
    header: "#333",
    bg: "#f8fafc",
    notice: "#e3f2fd",
  },
  {
    name: "Purple",
    accent: "#9c27b0",
    header: "#222",
    bg: "#f6f2fa",
    notice: "#f3eafc",
  },
  {
    name: "Green",
    accent: "#388e3c",
    header: "#222",
    bg: "#f4fff5",
    notice: "#e0f7ef",
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
      },
    ])
  );

  const [taxPercent, setTaxPercent] = useState(10);
  const [taxAmount, setTaxAmount] = useState(invoice.tax);
  const [grandTotal, setGrandTotal] = useState(invoice.total);

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
          <div
            className="no-print"
            style={{
              display: "flex",
              alignItems: "center",
              margin: "24px 0 0 12px",
            }}
          >
            <span style={{ marginRight: 16, fontWeight: 500, fontSize: 15 }}>
              Color theme:
            </span>
            {COLORTHEMES.map((t, idx) => (
              <button
                key={t.name}
                style={{
                  marginRight: 8,
                  padding: "4px 14px",
                  borderRadius: 18,
                  border:
                    idx === themeIdx
                      ? `2px solid ${t.accent}`
                      : "1px solid #ccc",
                  fontWeight: 600,
                  fontSize: 15,
                  background: idx === themeIdx ? t.notice : "#fff",
                  cursor: "pointer",
                  color: t.accent,
                }}
                onClick={() => setThemeIdx(idx)}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div
            className="no-print"
            style={{ textAlign: "right", margin: "10px 14px 24px 0" }}
          >
            <button
              style={{
                background: "#c026d3",
                color: "#fff",
                borderRadius: 6,
                border: "none",
                padding: "7px 18px",
                fontWeight: "bold",
                fontSize: 15,
                cursor: "pointer",
                marginLeft: 8,
              }}
              onClick={isEditing ? handleSave : handleEditToggle}
            >
              {isEditing ? "Save" : "Edit"}
            </button>
            <button
              style={{
                background: "#ea336a",
                color: "#fff",
                borderRadius: 6,
                border: "none",
                padding: "7px 18px",
                fontWeight: "bold",
                fontSize: 15,
                cursor: "pointer",
                marginLeft: 8,
              }}
              onClick={handleExportPDF}
            >
              Export as PDF
            </button>
            <button
              style={{
                background: "#222",
                color: "#fff",
                borderRadius: 6,
                border: "none",
                padding: "7px 18px",
                fontWeight: "bold",
                fontSize: 15,
                cursor: "pointer",
                marginLeft: 8,
              }}
              onClick={handlePrint}
            >
              Print
            </button>
          </div>

          {/* Main container */}
          <div
            ref={componentRef}
            className="invoice-container"
            style={{
              maxWidth: 950,
              margin: "0 auto",
              background: theme.bg,
              borderRadius: 14,
              boxShadow: "0 2px 18px rgba(0,0,0,0.07)",
              padding: "32px 28px 18px 28px",
              color: theme.header,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 18,
                borderBottom: "2px solid #e0e6ed",
                paddingBottom: 8,
              }}
            >
              <div>
                <div
                  style={{ color: theme.accent, fontWeight: 700, fontSize: 27 }}
                >
                  {invoice.to.name}
                </div>
                <div>{invoice.to.mobile}</div>
                <div>{invoice.to.email}</div>
                <div>{invoice.to.address}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{ color: theme.accent, fontWeight: 700, fontSize: 32 }}
                >
                  {invoice.invoiceId}
                </div>
                <div>
                  <b>Invoice Date:</b>{" "}
                  {isEditing ? (
                    <DatePicker
                      value={editInvoiceDate ? new Date(editInvoiceDate) : null}
                      onChange={(newValue) =>
                        setEditInvoiceDate(
                          newValue ? newValue.toISOString().slice(0, 10) : ""
                        )
                      }
                      slotProps={{
                        textField: { size: "small", sx: { width: 150 } },
                      }}
                      inputFormat="dd, MMM yyyy"
                    />
                  ) : (
                    localInvoiceDate
                  )}
                </div>
                <div>
                  <b>Due Date:</b>{" "}
                  {isEditing ? (
                    <DatePicker
                      value={editDueDate ? new Date(editDueDate) : null}
                      onChange={(newValue) =>
                        setEditDueDate(
                          newValue ? newValue.toISOString().slice(0, 10) : ""
                        )
                      }
                      slotProps={{
                        textField: { size: "small", sx: { width: 150 } },
                      }}
                      inputFormat="dd, MMM yyyy"
                    />
                  ) : (
                    localDueDate
                  )}
                </div>
              </div>
            </div>

            {/* Invoice To */}
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  color: "#555",
                  fontSize: 15,
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                INVOICE TO:
              </div>
              <div style={{ fontSize: 21, fontWeight: 700 }}>
                {invoice.from.name}
              </div>
              <div>{invoice.from.mobile}</div>
              <div>{invoice.from.email}</div>
              <div>{invoice.from.address}</div>
            </div>

            {/* Invoice Table */}
            <div
              style={{
                borderRadius: 11,
                overflow: "hidden",
                border: "1px solid #eee",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <table
                id="invoicetable"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 15,
                  background: "#fff",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: theme.notice,
                      color: theme.header,
                      fontSize: 16,
                    }}
                  >
                    <th style={{ fontWeight: 700, padding: "10px 6px" }}>#</th>
                    <th style={{ fontWeight: 700, padding: "10px 6px" }}>
                      Description
                    </th>
                    <th style={{ fontWeight: 700, padding: "10px 6px" }}>
                      Rate Mode
                    </th>
                    <th style={{ fontWeight: 700, padding: "10px 6px" }}>
                      Duration
                    </th>
                    <th style={{ fontWeight: 700, padding: "10px 6px" }}>
                      Rate Amount
                    </th>
                    <th style={{ fontWeight: 700, padding: "10px 6px" }}>
                      Currency
                    </th>
                    <th
                      style={{
                        fontWeight: 700,
                        padding: "10px 6px",
                        position: "relative",
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
                        {/* Parent row, border bottom only if no children */}
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
                            {item.name}
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
                                min="0"
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
                        {savedExpenses[idx] &&
                          savedExpenses[idx].map((exp, eIdx) => {
                            const isLastSaved =
                              eIdx === savedExpenses[idx].length - 1;
                            const isLastChildRow =
                              isLastSaved &&
                              (!isEditing ||
                                additionalExpenses[idx].length === 0);
                            return (
                              <tr
                                key={`saved-exp-${idx}-${eIdx}`}
                                style={{
                                  background: parentBg,
                                  borderBottom: isLastChildRow
                                    ? "1px solid #e0e6ed"
                                    : "none",
                                }}
                              >
                                <td style={{ background: theme.accent }} />
                                <td
                                  style={{
                                    fontStyle: !isEditing ? "italic" : "normal",
                                    color: !isEditing ? "#555" : "#000",
                                    verticalAlign: "middle",
                                    padding: 4,
                                  }}
                                >
                                  {!isEditing ? (
                                    exp.label
                                  ) : (
                                    <Select
                                size="small"
                                value={
                                  exp.label
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
                                sx={{
                                  height:'20px'
                                }}
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
                                  )}
                                </td>
                                <td>
                                  {/* <input
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
                                  /> */}
                                  {localInvoiceItems[idx].ratemode}
                                </td>
                                <td style={{ padding: 4, textAlign: "center" }}>
                                  {!isEditing ? (
                                    exp.duration ?? 0
                                  ) : (
                                    <input
                                      type="number"
                                      min="0"
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
                                <td style={{ padding: 4, textAlign: "right" }}>
                                  {!isEditing ? (
                                    exp.amount
                                  ) : (
                                    <input
                                      type="number"
                                      min="0"
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
                                <td>{exp.currency}</td>
                                <td
                                  style={{
                                    fontWeight: "bold",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    justifyContent: "center",
                                    padding: 4,
                                  }}
                                >
                                  {(
                                    (exp.duration && exp.duration > 0
                                      ? exp.amount * exp.duration
                                      : exp.amount) || 0
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
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                        {/* Empty editable child expense row */}
                        {isEditing && (
                          <tr
                            key={`empty-exp-${idx}`}
                            style={{
                              background: parentBg,
                              borderBottom: "1px solid #e0e6ed",
                            }}
                          >
                            <td style={{ background: theme.accent }} />
                            <td>
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
                                sx={{
                                  height:'20px'
                                }}
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
                            <td>
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
                            <td>
                              <input
                                type="number"
                                min="0"
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
                            <td>
                              <input
                                type="number"
                                min="0"
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
                            <td>
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
                            <td style={{ textAlign: "center" }}>
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
            </div>

            <div
              style={{
                fontWeight: "bold",
                fontSize: 22,
                margin: "30px 0 14px 0",
                color: theme.accent,
              }}
            >
              Thank you!
            </div>
            <div
              style={{
                background: theme.notice,
                borderLeft: `5px solid ${theme.accent}`,
                padding: "12px 18px",
                fontSize: 15,
                borderRadius: 7,
                marginBottom: 22,
                marginTop: 10,
              }}
            >
              <b>NOTICE</b> {invoice.notice}
            </div>
            <div
              style={{
                marginTop: 35,
                fontSize: 14,
                color: "#7c7c7c",
                textAlign: "center",
                borderTop: "1px solid #e0e6ed",
                paddingTop: 9,
              }}
            >
              Invoice was created on a computer and is valid without the
              signature and seal.
            </div>
          </div>
        </div>
      </>
    </LocalizationProvider>
  );
}
