import React, { createContext, useContext, useState, useEffect } from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchContext = createContext(null);

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return ctx;
};

const PLACEHOLDER_MAP = {
  clients: "Search clients...",
  companies: "Search companies...",
  banks: "Search banks...",
  vendors: "Search vendors...",
  consultants: "Search consultants...",
  developer: "Search developers...",
  contracts: "Search contracts...",
  projects: "Search projects...",
  templates: "Search templates...",
  invoices: "Search invoices & templates...",
};

export const SearchProvider = ({ children, currentKey }) => {
  const [searchValue, setSearchValue] = useState("");

  // Reset search when switching between sections
  useEffect(() => {
    setSearchValue("");
  }, [currentKey]);

  const placeholder = PLACEHOLDER_MAP[currentKey] || "Search...";

  return (
    <SearchContext.Provider value={{ searchValue, setSearchValue, placeholder }}>
      {children}
    </SearchContext.Provider>
  );
};

export const CommonSearchBar = () => {
  const { searchValue, setSearchValue, placeholder } = useSearch();

  return (
    <TextField
      placeholder={placeholder}
      variant="outlined"
      size="small"
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      sx={{
        flex: 1,
        maxWidth: 400,
        minWidth: 200,
        "& .MuiOutlinedInput-root": {
          borderRadius: "24px",
          bgcolor: "action.hover",
          "& fieldset": { border: "1px solid", borderColor: "divider" },
          "&:hover fieldset": { borderColor: "primary.main" },
          "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: "1px" },
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" fontSize="small" />
          </InputAdornment>
        ),
      }}
    />
  );
};
