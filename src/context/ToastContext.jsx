import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const showSuccess = useCallback((message) => {
    setToast({ open: true, severity: "success", message });
  }, []);

  const showError = useCallback((message,error) => {
    console.error(error);
    setToast({ open: true, severity: "error", message });
  }, []);

  const showToast = useCallback(({ severity = "info", message }) => {
    setToast({ open: true, severity, message });
  }, []);

  const handleClose = useCallback((_, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const value = { showSuccess, showError, showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.severity === "error" ? 6000 : 3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: "100%",
            maxWidth: 600,
            fontSize: "1rem",
            fontWeight: 500,
            boxShadow: 3,
            borderRadius: 2,
            whiteSpace: "pre-wrap",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
