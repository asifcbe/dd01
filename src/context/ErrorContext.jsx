import React, { createContext, useContext, useState, useCallback } from "react";

const ErrorContext = createContext(null);

export const useErrorScreen = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) {
    throw new Error("useErrorScreen must be used within ErrorProvider");
  }
  return ctx;
};

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState({
    visible: false,
    status: null,
    message: "",
  });

  const showErrorOnScreen = useCallback((status, message = "Something went wrong") => {
    setError({
      visible: true,
      status: status ?? 500,
      message: message || "Something went wrong",
    });
  }, []);

  const dismissError = useCallback(() => {
    setError((prev) => ({ ...prev, visible: false }));
  }, []);

  const value = { showErrorOnScreen, dismissError, error };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};
