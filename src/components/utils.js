function getInvoiceData(actualInvoice) {
  let invoiceItems = [];
  actualInvoice.invoice_items.map((itemgroup) => {
    let item = {
      id: itemgroup[0].id,
      name: `${itemgroup[0].name} , ${itemgroup[0].address}`,
      duration: 0,
      ratemode: itemgroup[0].project ? itemgroup[0].project.rate_mode : "",
      rateamount: itemgroup[0].project ? itemgroup[0].project.rate_amount : 0,
      currency: itemgroup[0].project ? itemgroup[0].project.currency : "",
      total: 0,
      description: "",
    };

    invoiceItems.push(item);
  })
  return {
    invoiceId: `INV-${actualInvoice.template_id}`,
    from: actualInvoice.client,
    to: actualInvoice.company,
    invoicedate: actualInvoice.invoice_date,
    duedate: actualInvoice.due_date,
    invoiceitems: invoiceItems,
    subtotal: 100000,
    tax: 10000,
    total: 110000,
    notice:
      "A finance charge of 1.5% will be made on unpaid balances after 30 days.",
    bank_id: actualInvoice.bank_id,
  }
}
const errorLabels = {
  401: "Authentication Failed. Please check your credentials.",
  403: "Authorization Failed. You don't have permission to do this.",
  404: "We couldn't find what you're looking for",
  500: "Something went wrong on our end. Please try again later.",
  501: "Not implemented. Please try again later.",
  502: "Service temporarily unavailable. Please try again.",
  503: "Service is busy. Please try again in a moment.",
  504: "Request took too long. Please try again.",
}


async function handleApiError(response, defaultMsg = "An error occurred") {
  if (response.ok) return response;

  let errMsg = defaultMsg;
  try {
    const errorData = await response.json();
    // Prioritize backend provided messages
    if (errorData.detail) {
      // detail can be string or array of strings
      if (Array.isArray(errorData.detail)) {
        errMsg = errorData.detail.map(e => `• ${e}`).join('\n');
      } else if (typeof errorData.detail === 'object' && errorData.detail.message) {
        // Some frameworks nest it like detail.message
        errMsg = Array.isArray(errorData.detail.message)
          ? errorData.detail.message.map(e => `• ${e}`).join('\n')
          : errorData.detail.message;
      } else if (typeof errorData.detail === 'object' && errorData.detail.error) {
        errMsg = Array.isArray(errorData.detail.error)
          ? errorData.detail.error.map(e => `• ${e}`).join('\n')
          : errorData.detail.error;
      } else {
        errMsg = errorData.detail;
      }
    } else if (errorData.message) {
      errMsg = errorData.message;
    } else if (errorData.error) {
      errMsg = errorData.error;
    }

    if(errorData.detail?.field){
      let errMsgArray = errMsg.split('•');
      let newErrMsgArray = [];
      errMsgArray.forEach(e => {
        if(e[0] != '•'){
        newErrMsgArray.push(`• ${e}`);
        } else {
          newErrMsgArray.push(e);
        }
      });
      newErrMsgArray.push(`• Field: ${errorData.detail.field}`)
      errMsg = [...newErrMsgArray].reverse().join('\n');
    }
  } catch (e) {
    // If parsing fails, use user-friendly fallback messages
    if (response.status === 400) errMsg = "Invalid request. Please check your input.";
    else if (errorLabels.hasOwnProperty(response.status)) errMsg = errorLabels[response.status];
  }

  const err = new Error(errMsg);
  err.status = response.status;
  throw err;
}




export { getInvoiceData, handleApiError, errorLabels };