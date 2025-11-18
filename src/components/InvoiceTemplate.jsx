import React, { useState, useRef } from "react";

// Example color themes
const COLOR_THEMES = [
  {
    name: "Blue",
    accent: "#1976d2",
    header: "#333",
    bg: "#f8fafc",
    notice: "#e3f2fd"
  },
  {
    name: "Purple",
    accent: "#9c27b0",
    header: "#222",
    bg: "#f6f2fa",
    notice: "#f3eafc"
  },
  {
    name: "Green",
    accent: "#388e3c",
    header: "#222",
    bg: "#f4fff5",
    notice: "#e0f7ef"
  }
];

// Component for theme selector
function ThemePicker({ themeIdx, setThemeIdx }) {
  return (
    <div style={{ marginBottom: 24 }} className="no-print">
      <span style={{ marginRight: 16, fontWeight: 500 }}>Color theme:</span>
      {COLOR_THEMES.map((theme, idx) => (
        <button
          key={theme.name}
          style={{
            marginRight: 8,
            padding: "4px 14px",
            borderRadius: 18,
            border: idx === themeIdx ? `2px solid ${theme.accent}` : "1px solid #ccc",
            fontWeight: 600,
            background: idx === themeIdx ? theme.notice : "#fff",
            cursor: "pointer",
            color: theme.accent
          }}
          onClick={() => setThemeIdx(idx)}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
}

// The invoice template itself
export default function InvoiceTemplate({
  invoiceId = "INV-1",
  from = {},
  to = {},
  invoiceDate = "17, Nov 2025",
  dueDate = "17, Dec 2025",
  items = [],
  subtotal = "1,00,000",
  tax = "10,000",
  total = "1,10,000",
  notice = "A finance charge of 1.5% will be made on unpaid balances after 30 days.",
  templateStyles = ["Modern", "Classic"],
  defaultStyle = 0,
  userName = "Reed Ireland"
}) {
  const [themeIdx, setThemeIdx] = useState(0);
  const [styleIdx, setStyleIdx] = useState(defaultStyle);
  const componentRef = useRef();

  // Dynamic colors from theme
  const theme = COLOR_THEMES[themeIdx];

  // Print handler - prints only the invoice content
  const handlePrint = () => {
    const printContent = componentRef.current;
    const originalContent = document.body.innerHTML;
    
    // Create a temporary container with styles
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Invoice</title>');
    printWindow.document.write('<style>' + generatePrintStyles() + '</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Export as PDF handler
  const handleExportPDF = () => {
    handlePrint(); // Uses same print functionality
  };

  // Generate styles for printing
  const generatePrintStyles = () => {
    return `
      body {
        margin: 0;
        padding: 20px;
        font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
      }
      .invoice-container {
        max-width: 950px;
        margin: 0 auto;
        background: ${theme.bg};
        border-radius: 12px;
        padding: 32px 28px 18px 28px;
        color: ${theme.header};
      }
      .invoice-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 18px;
        border-bottom: 2px solid #e0e6ed;
        padding-bottom: 8px;
      }
      .invoice-header-left {
        font-size: 20px;
      }
      .invoice-header-left .userName {
        color: ${theme.accent};
        font-weight: bold;
        font-size: 27px;
      }
      .invoice-header-right {
        text-align: right;
      }
      .invoice-header-right .invoiceId {
        color: ${theme.accent};
        font-weight: bold;
        font-size: 32px;
      }
      .invoice-details-grid {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin: 28px 0 12px 0;
      }
      .invoice-to-details .label {
        color: #555;
        font-size: 15px;
        margin-bottom: 4px;
        font-weight: 500;
      }
      .invoice-to-details .toName {
        font-size: 23px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      .invoice-table {
        margin-top: 10px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #eee;
      }
      .invoice-table table {
        width: 100%;
        border-collapse: collapse;
        font-size: 15px;
        background: #fff;
      }
      .invoice-table th {
        background: #f6fafd;
        color: #222;
        font-size: 16px;
        font-weight: bold;
        padding: 9px 8px;
        border-bottom: 2px solid #e0e6ed;
        text-align: left;
      }
      .invoice-table td {
        padding: 11px 8px;
        border-bottom: 1px solid #ededed;
        vertical-align: top;
      }
      .invoice-table .row-index {
        background: ${theme.accent};
        color: #fff;
        font-weight: bold;
        font-size: 18px;
        text-align: center;
        min-width: 44px;
        border-radius: 5px 0 0 5px;
      }
      .invoice-table .row-total {
        background: ${theme.accent};
        color: #fff;
        font-weight: bold;
        text-align: right;
        min-width: 48px;
        border-radius: 0 5px 5px 0;
      }
      .invoice-table tbody tr:nth-child(even) {
        background: #f4fbff;
      }
      .invoice-table tfoot td {
        font-size: 16px;
        font-weight: bold;
        padding: 12px 8px;
        border-top: 2px solid #e0e6ed;
      }
      .invoice-table tfoot tr:last-child td {
        color: ${theme.accent};
        font-size: 19px;
      }
      .invoice-thanks {
        font-weight: bold;
        font-size: 22px;
        margin: 30px 0 14px 0;
        color: ${theme.accent};
      }
      .invoice-notice {
        background: ${theme.notice};
        border-left: 5px solid ${theme.accent};
        padding: 12px 18px;
        font-size: 15px;
        border-radius: 7px;
        margin-bottom: 22px;
        margin-top: 10px;
      }
      .invoice-footer {
        margin-top: 35px;
        font-size: 14px;
        color: #7c7c7c;
        text-align: center;
        border-top: 1px solid #e0e6ed;
        padding-top: 9px;
      }
      a {
        color: ${theme.accent};
        text-decoration: underline;
        font-weight: 600;
      }
    `;
  };

  const css = `
.invoice-container {
  max-width: 950px;
  margin: 0 auto;
  font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
  background: ${theme.bg};
  border-radius: 12px;
  box-shadow: 0 2px 18px rgba(0,0,0,0.07);
  padding: 32px 28px 18px 28px;
  color: ${theme.header};
}
.invoice-toolbar {
  text-align: right;
  margin-bottom: 18px;
}
.invoice-toolbar .btn {
  background: ${theme.accent};
  color: #fff;
  border-radius: 6px;
  border: none;
  padding: 7px 18px;
  margin-left: 10px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
}
.invoice-toolbar .btn:hover {
  opacity: 0.85;
}
.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
  border-bottom: 2px solid #e0e6ed;
  padding-bottom: 8px;
}
.invoice-header-left {
  font-size: 20px;
}
.invoice-header-left .userName {
  color: ${theme.accent};
  font-weight: bold;
  font-size: 27px;
}
.invoice-header-right {
  text-align: right;
}
.invoice-header-right .invoiceId {
  color: ${theme.accent};
  font-weight: bold;
  font-size: 32px;
}
.invoice-details-grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 28px 0 12px 0;
}
.invoice-to-details .label {
  color: #555;
  font-size: 15px;
  margin-bottom: 4px;
  font-weight: 500;
}
.invoice-to-details .toName {
  font-size: 23px;
  font-weight: bold;
  margin-bottom: 4px;
}
.invoice-table {
  margin-top: 10px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.invoice-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  background: #fff;
}
.invoice-table th {
  background: #f6fafd;
  color: #222;
  font-size: 16px;
  font-weight: bold;
  padding: 9px 0;
  border-bottom: 2px solid #e0e6ed;
}
.invoice-table td {
  padding: 11px 8px;
  border-bottom: 1px solid #ededed;
  vertical-align: top;
}
.invoice-table .row-index {
  background: ${theme.accent};
  color: #fff;
  font-weight: bold;
  font-size: 18px;
  text-align: center;
  min-width: 44px;
  border-radius: 5px 0 0 5px;
}
.invoice-table .row-total {
  background: ${theme.accent};
  color: #fff;
  font-weight: bold;
  text-align: right;
  min-width: 48px;
  border-radius: 0 5px 5px 0;
}
.invoice-table tbody tr:nth-child(even) {
  background: #f4fbff;
}
.invoice-table tfoot td {
  font-size: 16px;
  font-weight: bold;
  padding: 12px 8px;
  border-top: 2px solid #e0e6ed;
}
.invoice-table tfoot tr:last-child td {
  color: ${theme.accent};
  font-size: 19px;
}
.invoice-thanks {
  font-weight: bold;
  font-size: 22px;
  margin: 30px 0 14px 0;
  color: ${theme.accent};
}
.invoice-notice {
  background: ${theme.notice};
  border-left: 5px solid ${theme.accent};
  padding: 12px 18px;
  font-size: 15px;
  border-radius: 7px;
  margin-bottom: 22px;
  margin-top: 10px;
}
.invoice-footer {
  margin-top: 35px;
  font-size: 14px;
  color: #7c7c7c;
  text-align: center;
  border-top: 1px solid #e0e6ed;
  padding-top: 9px;
}
.invoice-style-switch {
  margin: 12px 0 16px 0;
}
.invoice-style-switch button {
  margin-right: 10px;
  padding: 5px 14px;
  border-radius: 18px;
  font-weight: 500;
  background: #f6f6f6;
  border: 2px solid ${theme.accent};
  color: ${theme.accent};
  cursor: pointer;
  opacity: .7;
}
.invoice-style-switch button.selected {
  background: ${theme.accent};
  color: #fff;
  opacity: 1;
}

@media (max-width: 800px) {
  .invoice-header, .invoice-details-grid { 
    flex-direction: column; 
    align-items: flex-start; 
  }
}
`;

  // Render invoice item rows
  function renderRows() {
    return items.map((item, idx) => (
      <tr key={idx}>
        <td className="row-index">{String(idx + 1).padStart(2, "0")}</td>
        <td>
          <a href="#" style={{ color: theme.accent, textDecoration: "underline", fontWeight: 600 }}>
            {item.name}
          </a>, {item.location}
          {item.thru?.map((thru, i) => (
            <div key={i}><b>thru:</b> {thru}</div>
          ))}
        </td>
        <td>{item.rateMode}</td>
        <td>{item.duration}</td>
        <td>{item.rateAmount}</td>
        <td>{item.currency}</td>
        <td className="row-total">{item.total}</td>
      </tr>
    ));
  }

  // Render template style switcher
  function renderStylePicker() {
    return (
      <div className="invoice-style-switch no-print">
        <span style={{ fontWeight: 500, marginRight: 8 }}>Invoice style:</span>
        {templateStyles.map((style, idx) => (
          <button
            key={style}
            className={idx === styleIdx ? "selected" : ""}
            onClick={() => setStyleIdx(idx)}
          >{style}</button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <style>{css}</style>
      
      {/* Controls - NOT printed */}
      <div className="no-print">
        {renderStylePicker()}
        <ThemePicker themeIdx={themeIdx} setThemeIdx={setThemeIdx} />
        
        {/* Toolbar */}
        <div className="invoice-toolbar">
          <button className="btn" style={{ background: "#ea336a" }} onClick={handleExportPDF}>
            Export as PDF
          </button>
          <button className="btn" style={{ background: "#222" }} onClick={handlePrint}>
            Print
          </button>
        </div>
      </div>

      {/* Invoice content - this will be printed with styles preserved */}
      <div ref={componentRef}>
        <div className="invoice-container">
          {/* Header */}
          <div className="invoice-header">
            <div className="invoice-header-left">
              <div className="userName">{from.name}</div>
              <div>{from.mobile}</div>
              <div>{from.email}</div>
              <div>{from.address}</div>
            </div>
            <div className="invoice-header-right">
              <div className="invoiceId">{invoiceId}</div>
              <div>
                <b>Invoice Date:</b> {invoiceDate}
              </div>
              <div>
                <b>Due Date:</b> {dueDate}
              </div>
            </div>
          </div>

          {/* Details With Table */}
          <div className="invoice-details-grid">
            <div className="invoice-to-details">
              <div className="label">INVOICE TO:</div>
              <div className="toName">{to.name}</div>
              <div>{to.mobile}</div>
              <div>{to.email}</div>
              <div>{to.address}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="invoice-table">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Description</th>
                      <th>Rate Mode</th>
                      <th>Duration</th>
                      <th>Rate Amount</th>
                      <th>Currency</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>{renderRows()}</tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4}></td>
                      <td colSpan={2}>SUBTOTAL</td>
                      <td>{subtotal}</td>
                    </tr>
                    <tr>
                      <td colSpan={4}></td>
                      <td colSpan={2}>TAX 10%</td>
                      <td>{tax}</td>
                    </tr>
                    <tr>
                      <td colSpan={4}></td>
                      <td colSpan={2} style={{ color: theme.accent }}>GRAND TOTAL</td>
                      <td style={{ color: theme.accent, fontWeight: "bold" }}>{total}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="invoice-thanks">Thank you!</div>
          <div className="invoice-notice">
            <b>NOTICE:</b> {notice}
          </div>
          <div className="invoice-footer">
            Invoice was created on a computer and is valid without the signature and seal.
          </div>
        </div>
      </div>
    </div>
  );
}
