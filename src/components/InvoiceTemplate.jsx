import React, { useState, useRef } from "react";
import { Typography } from "@mui/material";

// Color themes
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

// Utilities: Date format <-> ISO
function formatDateToISO(dateStr) {
  if (!dateStr) return "";
  const [day, monthStr, year] = dateStr.replace(/,/g, "").split(" ");
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  return `${year}-${months[monthStr]}-${day.padStart(2, "0")}`;
}
function formatISOToDisplay(dateISO) {
  if (!dateISO) return "";
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const [year, month, day] = dateISO.split("-");
  return `${parseInt(day)}, ${months[parseInt(month, 10) - 1]} ${year}`;
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
    notice: "A finance charge of 1.5% will be made on unpaid balances after 30 days.",
  },
  onExportPDF,
  onPrint,
  template = { name: "Invoice" }
}) {
  const componentRef = useRef(null);
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = COLORTHEMES[themeIdx];
  const [isEditing, setIsEditing] = useState(false);

  const [editInvoiceDate, setEditInvoiceDate] = useState(formatDateToISO(invoice.invoicedate));
  const [editDueDate, setEditDueDate] = useState(formatDateToISO(invoice.duedate));
  const [localInvoiceItems, setLocalInvoiceItems] = useState(invoice.invoiceitems);
  const [localInvoiceDate, setLocalInvoiceDate] = useState(invoice.invoicedate);
  const [localDueDate, setLocalDueDate] = useState(invoice.duedate);

  // Additional expenses: array of arrays, each item links to expenses
  const [additionalExpenses, setAdditionalExpenses] = useState(localInvoiceItems.map(() => []));
  // Finalized, shown in view mode
  const [savedExpenses, setSavedExpenses] = useState(localInvoiceItems.map(() => []));

  // Add expense row after an item
  const handleAddExpense = idx => {
    setAdditionalExpenses(state =>
      state.map((row, i) =>
        i === idx ? [...row, { label: "", amount: "", currency: localInvoiceItems[idx].currency }] : row
      )
    );
  };

  // Edit expense (label/amount)
  const handleExpenseChange = (rowIdx, expenseIdx, key, value) => {
    setAdditionalExpenses(state =>
      state.map((row, i) =>
        i === rowIdx
          ? row.map((exp, eIdx) =>
              eIdx === expenseIdx ? { ...exp, [key]: value } : exp
            )
          : row
      )
    );
  };

  // Remove expense from a row
  const handleRemoveExpense = (rowIdx, expenseIdx) => {
    setAdditionalExpenses(state =>
      state.map((row, i) =>
        i === rowIdx ? row.filter((_, eIdx) => eIdx !== expenseIdx) : row
      )
    );
  };

  // Edit toggle
  const handleEditToggle = () => {
    if (!isEditing) {
      setEditInvoiceDate(formatDateToISO(localInvoiceDate));
      setEditDueDate(formatDateToISO(localDueDate));
      setAdditionalExpenses(savedExpenses.map(es => es.map(exp => ({ ...exp }))));
    }
    setIsEditing(!isEditing);
  };

  // Duration editing for any item
  const handleDurationChange = (idx, value) => {
    const updatedItems = localInvoiceItems.map((item, i) =>
      i === idx ? { ...item, duration: value } : item
    );
    setLocalInvoiceItems(updatedItems);
  };

  // Save invoice edits
  const handleSave = () => {
    setLocalInvoiceDate(formatISOToDisplay(editInvoiceDate));
    setLocalDueDate(formatISOToDisplay(editDueDate));
    setIsEditing(false);
    setSavedExpenses(additionalExpenses.map(es =>
      es.filter(exp => exp.label.trim() !== "" || exp.amount !== "")
    ));
  };

  // Print handler - properly styled
  const handlePrint = () => {
    const printContent = componentRef.current.cloneNode(true);
    const printWindow = window.open('', '', 'width=800,height=600');
    
    printWindow.document.write('<html><head><title>Invoice</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        margin: 20px; 
        font-family: 'Segoe UI', Roboto, Arial, sans-serif; 
        background: white;
        color: ${theme.header};
      }
      .invoice-container { 
        max-width: 950px; 
        margin: 0 auto; 
        background: ${theme.bg}; 
        border-radius: 14px; 
        box-shadow: 0 2px 18px rgba(0,0,0,0.07); 
        padding: 32px 28px 18px 28px; 
        color: ${theme.header};
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        font-size: 15px; 
        background: #fff;
      }
      th { 
        background: ${theme.notice}; 
        color: ${theme.header}; 
        font-weight: 700; 
        padding: 10px 6px; 
        text-align: left;
      }
      td { 
        padding: 11px 8px; 
        border-bottom: 1px solid #ededed; 
      }
      .accent-color { 
        color: ${theme.accent} !important; 
      }
      .accent-bg { 
        background: ${theme.accent} !important; 
        color: #fff !important; 
      }
      .notice-bg {
        background: ${theme.notice} !important;
      }
      .border-bottom {
        border-bottom: 2px solid #e0e6ed;
      }
      .notice-box {
        background: ${theme.notice};
        border-left: 5px solid ${theme.accent};
        padding: 12px 18px;
        font-size: 15px;
        border-radius: 7px;
        margin-bottom: 22px;
        margin-top: 10px;
      }
      @media print {
        body { margin: 0; }
        .invoice-container { box-shadow: none; }
      }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for styles to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Export PDF handler - only invoice container
  const handleExportPDF = async () => {
    // Check if html2pdf is available
    if (typeof window.html2pdf === 'undefined') {
      alert('Please include html2pdf.js library. Add this to your HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>');
      handlePrint(); // Fallback to print
      return;
    }

    const element = componentRef.current; // Only the invoice container
    const opt = {
      margin: 10,
      filename: `invoice-${invoice.invoiceId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    try {
      await window.html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF generation failed:', error);
      handlePrint(); // Fallback to print
    }
  };

  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }} className="no-print">
        {template.name}
      </Typography>
      <div style={{
        background: theme.bg,
        minHeight: "100vh",
        fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
        color: theme.header,
      }}>
        {/* Theme Picker */}
        <div className="no-print" style={{
          display: "flex",
          alignItems: "center",
          margin: "24px 0 0 12px"
        }}>
          <span style={{ marginRight: 16, fontWeight: 500, fontSize: 15 }}>Color theme:</span>
          {COLORTHEMES.map((t, idx) => (
            <button
              key={t.name}
              style={{
                marginRight: 8,
                padding: "4px 14px",
                borderRadius: 18,
                border: idx === themeIdx ? `2px solid ${t.accent}` : "1px solid #ccc",
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
        <div className="no-print" style={{ textAlign: "right", margin: "10px 14px 24px 0" }}>
          <button
            style={{
              background: "#c026d3", color: "#fff", borderRadius: 6, border: "none", padding: "7px 18px",
              fontWeight: "bold", fontSize: 15, cursor: "pointer", marginLeft: 8,
            }}
            onClick={isEditing ? handleSave : handleEditToggle}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
          <button
            style={{
              background: "#ea336a", color: "#fff", borderRadius: 6, border: "none", padding: "7px 18px",
              fontWeight: "bold", fontSize: 15, cursor: "pointer", marginLeft: 8,
            }}
            onClick={handleExportPDF}
          >
            Export as PDF
          </button>
          <button
            style={{
              background: "#222", color: "#fff", borderRadius: 6, border: "none", padding: "7px 18px",
              fontWeight: "bold", fontSize: 15, cursor: "pointer", marginLeft: 8
            }}
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
        {/* Invoice Container - THIS IS WHAT GETS EXPORTED/PRINTED */}
        <div ref={componentRef} className="invoice-container" style={{
          maxWidth: 950,
          margin: "0 auto",
          background: theme.bg,
          borderRadius: 14,
          boxShadow: "0 2px 18px rgba(0,0,0,0.07)",
          padding: "32px 28px 18px 28px",
          color: theme.header,
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 18,
            borderBottom: "2px solid #e0e6ed",
            paddingBottom: 8
          }}>
            <div>
              <div style={{ color: theme.accent, fontWeight: 700, fontSize: 27 }}>
                {invoice.to.name}
              </div>
              <div>{invoice.to.mobile}</div>
              <div>{invoice.to.email}</div>
              <div>{invoice.to.address}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: theme.accent, fontWeight: 700, fontSize: 32 }}>INV-1</div>
              <div>
                <b>Invoice Date:</b> {localInvoiceDate}
              </div>
              <div>
                <b>Due Date:</b> {localDueDate}
              </div>
            </div>
          </div>
          {/* Invoice To */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#555", fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
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
          <div style={{
            borderRadius: 11,
            overflow: "hidden",
            border: "1px solid #eee",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 15,
              background: "#fff"
            }}>
              <thead>
                <tr style={{
                  background: theme.notice,
                  color: theme.header,
                  fontSize: 16
                }}>
                  <th style={{ fontWeight: 700, padding: "10px 6px" }}>#</th>
                  <th style={{ fontWeight: 700, padding: "10px 6px" }}>Description</th>
                  <th style={{ fontWeight: 700, padding: "10px 6px" }}>Rate Mode</th>
                  <th style={{ fontWeight: 700, padding: "10px 6px" }}>Duration</th>
                  <th style={{ fontWeight: 700, padding: "10px 6px" }}>Rate Amount</th>
                  <th style={{ fontWeight: 700, padding: "10px 6px" }}>Currency</th>
                  <th style={{ fontWeight: 700, padding: "10px 6px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {localInvoiceItems.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    {/* Main row */}
                    <tr style={
                      idx % 2 === 0
                        ? { background: "#fff" }
                        : { background: theme.notice }
                    }>
                      <td style={{
                        color: theme.accent,
                        fontWeight: "bold",
                        fontSize: 18,
                        textAlign: "center",
                        minWidth: 44,
                        borderRadius: "5px 0 0 5px"
                      }}>
                        {String(idx + 1).padStart(2, "0")}
                      </td>
                      <td>{item.name}</td>
                      <td>{item.ratemode}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={item.duration}
                            onChange={e => handleDurationChange(idx, Number(e.target.value))}
                            style={{ width: 60, borderRadius: 5, border: "1px solid #ccc", paddingLeft: 8 }}
                          />
                        ) : item.duration}
                      </td>
                      <td>{item.rateamount}</td>
                      <td>{item.currency}</td>
                      <td style={{
                        color: theme.accent,
                        fontWeight: "bold",
                        textAlign: "center",
                        minWidth: 48,
                        borderRadius: "0 5px 5px 0"
                      }}>{item.total}</td>
                    </tr>
                    {/* Expense rows (edit mode) */}
                    {isEditing && additionalExpenses[idx] && additionalExpenses[idx].map((expense, eIdx) => (
                      <tr key={`exp-${idx}-${eIdx}`} style={{ background: "#fce7f3" }}>
                        <td></td>
                        <td colSpan={2}>
                          <input
                            type="text"
                            placeholder="Expense label"
                            value={expense.label}
                            onChange={e => handleExpenseChange(idx, eIdx, "label", e.target.value)}
                            style={{ width: '85%', borderRadius: 3, border: '1px solid #bbb', padding: 3, marginRight: 9 }}
                          />
                        </td>
                        <td></td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            placeholder="Amount"
                            value={expense.amount}
                            onChange={e => handleExpenseChange(idx, eIdx, "amount", e.target.value === "" ? "" : Number(e.target.value))}
                            style={{ width: 90, borderRadius: 3, border: '1px solid #bbb', padding: 3 }}
                          />
                        </td>
                        <td>{expense.currency}</td>
                        <td>
                          <button
                            onClick={() => handleRemoveExpense(idx, eIdx)}
                            style={{
                              background: '#ea336a', color: '#fff', padding: '5px 10px',
                              borderRadius: 3, border: 'none', cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Expense rows (view mode) */}
                    {!isEditing && savedExpenses[idx] && savedExpenses[idx].length > 0 && savedExpenses[idx].map((exp, eIdx) => (
                      <tr key={`saved-exp-${idx}-${eIdx}`} style={{ background: "#f8fafc" }}>
                        <td></td>
                        <td colSpan={2} style={{ fontStyle: "italic", color: "#ea336a" }}>{exp.label}</td>
                        <td></td>
                        <td></td>
                        <td>{exp.currency}</td>
                        <td style={{ fontWeight: "bold" }}>{exp.amount}</td>
                      </tr>
                    ))}
                    {/* Add Expense Button */}
                    {isEditing && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", background: "#f8fafc" }}>
                          <button
                            onClick={() => handleAddExpense(idx)}
                            style={{
                              background: theme.accent,
                              color: "#fff",
                              padding: "3px 20px",
                              borderRadius: 20,
                              border: "none",
                              fontWeight: "bold",
                              fontSize: 14,
                              cursor: "pointer",
                              margin: 5,
                            }}
                          >
                            Add Additional Expense
                          </button>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}></td>
                  <td colSpan={2} style={{ fontWeight: "bold", padding: 12, textAlign: "right" }}>SUBTOTAL</td>
                  <td style={{ fontWeight: "bold", padding: 12 }}>{invoice.subtotal.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={4}></td>
                  <td colSpan={2} style={{ fontWeight: "bold", padding: 12, textAlign: "right" }}>TAX 10%</td>
                  <td style={{ fontWeight: "bold", padding: 12 }}>{invoice.tax.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={4}></td>
                  <td colSpan={2} style={{
                    color: theme.accent, fontWeight: "bold", padding: 12,
                    textAlign: "right", fontSize: 19,
                  }}>GRAND TOTAL</td>
                  <td style={{
                    color: theme.accent, fontWeight: "bold", padding: 12,
                  }}>{invoice.total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* Thank You and Notice */}
          <div style={{
            fontWeight: "bold", fontSize: 22, margin: "30px 0 14px 0", color: theme.accent
          }}>
            Thank you!
          </div>
          <div style={{
            background: theme.notice,
            borderLeft: `5px solid ${theme.accent}`,
            padding: "12px 18px",
            fontSize: 15,
            borderRadius: 7,
            marginBottom: 22,
            marginTop: 10
          }}>
            <b>NOTICE</b> {invoice.notice}
          </div>
          <div style={{
            marginTop: 35,
            fontSize: 14,
            color: "#7c7c7c",
            textAlign: "center",
            borderTop: "1px solid #e0e6ed",
            paddingTop: 9
          }}>
            Invoice was created on a computer and is valid without the signature and seal.
          </div>
        </div>
      </div>
    </>
  );
}
