import React, { useState, useEffect, useContext } from "react";
import {
  Business as CompaniesIcon,
  AccountBalance as BanksIcon
} from "@mui/icons-material";
import { Tabs, Tab, Box } from "@mui/material";
import ParticipantManager from "./ParticipantManager";
import { useThemeContext } from "../context/ThemeContext";

  
const COUNTRY_OPTIONS = [
  "United States",
  "United Kingdom",
  "India",
  "Germany",
  "France",
  "Japan",
  "Canada",
  "Australia",
  "China",
];

const companyFields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "address", label: "Address", type: "text" },
  // { name: "country", label: "Country", type: "select", options: COUNTRY_OPTIONS },
  { name: "vat_num", label: "VAT Number", type: "text" },
  { name: "reg_num", label: "Reg Number", type: "text" },
];

const companyDisplayFields = [
  { name: "email", label: "Email" },
  { name: "mobile", label: "Mobile" },
  { name: "address", label: "Address" },
  { name: "country", label: "Country" },
  { name: "vat_num", label: "VAT Number" },
  { name: "reg_num", label: "Reg Number" },
];

const companyInitialForm = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  country: "",
  vat_num: "",
  reg_num: "",
};

const bankFields = [
  { name: "name", label: "Name", type: "text" },
  { name: "code", label: "Code", type: "text" },
  { name: "swift_code", label: "Swift Code", type: "text" },
  { name: "country", label: "Country", type: "select", options: COUNTRY_OPTIONS },
  { name: "branch", label: "Branch", type: "text" },
  { name: "city", label: "City", type: "text" },
  { name: "account_number", label: "Account Number", type: "text" },
  { name: "account_holder_name", label: "Account Holder Name", type: "text" },
];

const bankDisplayFields = [
  { name: "name", label: "Name" },
  { name: "code", label: "Code" },
  { name: "swift_code", label: "Swift Code" },
  { name: "country", label: "Country" },
  { name: "branch", label: "Branch" },
  { name: "city", label: "City" },
  { name: "account_number", label: "Account Number" },
  { name: "account_holder_name", label: "Account Holder Name" },
];

const bankInitialForm = {
  name: "",
  code: "",
  swift_code: "",
  country: "",
  branch: "",
  city: "",
  account_number: "",
  account_holder_name: "",
};

export default function Companies({ isBank }) {
  const [tabValue, setTabValue] = useState(isBank ? 1 : 0);
  const { currentThemeName } = useThemeContext();
  const borderColor={
    light: "black",
    dark: "white",
    navy: "rgb(0, 188, 212)"
  }
  // Update tab value when isBank prop changes
  useEffect(() => {
    setTabValue(isBank ? 1 : 0);
  }, [isBank]);


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Log it when component mounts
  useEffect(() => {
    console.log('Current theme:', currentThemeName);
  }, [currentThemeName]);

  return (
    <Box>
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        aria-label="companies and banks tabs"
        sx={{
          minHeight: '52px',
          mb: 0,
          '& .MuiTabs-indicator': {
            display: 'none',
          },
          '& .MuiTabs-flexContainer': {
            gap: '8px',
          },
        }}
      >
        <Tab 
          label="Companies" 
          sx={{
            position: 'relative',
            minHeight: '52px',
            minWidth: '140px',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
            letterSpacing: '0.3px',
            color: tabValue === 0 ? '#ffffff !important' : 'text.secondary',
            bgcolor: tabValue === 0 ? 'primary.main' : 'background.default',
            border: tabValue === 0 ? 'none' : `1px solid ${borderColor[currentThemeName]}`,
            borderRadius: 0,
            px: 4,
            py: 1.5,
            // Modified clipPath to prevent border cutoff
            clipPath: tabValue === 0 
              ? 'polygon(0% 0%, 85% 0%, 100% 100%, 0% 100%)'
              : 'polygon(0% 0%, calc(85% - 1px) 0%, calc(100% - 1px) 100%, 0% 100%)',
            boxShadow: tabValue === 0 ? '0 4px 12px rgba(0, 163, 255, 0.3)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: tabValue === 0 ? 2 : 1,
            // Add border styling specifically for the trapezoid shape
            '&::before': tabValue !== 0 ? {
              content: '""',
              position: 'absolute',
              top: '-2px',
              right: '0',
              bottom: '-2px',
              width: '16%', // Adjust this to match the diagonal edge
              background: borderColor[currentThemeName],
              clipPath: 'polygon(100% 0%, 0% 0%, 100% 100%)',
              zIndex: 2,
            } : {},
            '&:hover': {
              bgcolor: tabValue === 0 ? 'primary.main' : 'action.hover',
              // transform: tabValue === 0 ? 'translateY(-1px)' : 'translateY(-1px)',
              boxShadow: tabValue === 0 
                ? '0 6px 16px rgba(0, 163, 255, 0.4)' 
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '& .MuiTab-wrapper': {
              color: tabValue === 0 ? '#ffffff !important' : 'inherit',
            },
          }}
        />
        <Tab 
          label="Banks" 
          sx={{
            position: 'relative',
            minHeight: '52px',
            minWidth: '140px',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
            letterSpacing: '0.3px',
            color: tabValue === 1 ? '#ffffff !important' : 'text.secondary',
            bgcolor: tabValue === 1 ? 'primary.main' : 'background.default',
            border: tabValue === 1 ? 'none' : `1px solid ${borderColor[currentThemeName]}`,
            borderRadius: 0,
            px: 4,
            py: 1.5,
            // Modified clipPath to prevent border cutoff
            clipPath: tabValue === 1 
              ? 'polygon(0% 0%, 85% 0%, 100% 100%, 0% 100%)'
              : 'polygon(0% 0%, calc(85% - 1px) 0%, calc(100% - 1px) 100%, 0% 100%)',
            boxShadow: tabValue === 1 ? '0 4px 12px rgba(0, 163, 255, 0.3)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: tabValue === 1 ? 2 : 1,
            // Add border styling specifically for the trapezoid shape
            '&::before': tabValue !== 1 ? {
              content: '""',
              position: 'absolute',
              top: '-2px',
              right: '0',
              bottom: '-2px',
              width: '16%', // Adjust this to match the diagonal edge
              background: borderColor[currentThemeName],
              clipPath: 'polygon(100% 0%, 0% 0%, 100% 100%)',
              zIndex: 2,
            } : {},
            '&:hover': {
              bgcolor: tabValue === 1 ? 'primary.main' : 'action.hover',
              // transform: tabValue === 1 ? 'translateY(-1px)' : 'translateY(-1px)',
              boxShadow: tabValue === 1 
                ? '0 6px 16px rgba(0, 163, 255, 0.4)' 
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '& .MuiTab-wrapper': {
              color: tabValue === 1 ? '#ffffff !important' : 'inherit',
            },
          }}
        />
      </Tabs>
      {tabValue === 0 && (
        <ParticipantManager
          title="Companies"
          icon={CompaniesIcon}
          apiType="Company"
          apiDetailType="companies"
          apiDetailTypeSingle="company"
          fields={companyFields}
          displayFields={companyDisplayFields}
          initialForm={companyInitialForm}
          type2={() => 'Company'}
        />
      )}
      {tabValue === 1 && (
        <ParticipantManager
          title="Banks"
          icon={BanksIcon}
          apiType="Bank"
          apiDetailType="banks"
          apiDetailTypeSingle="bank"
          fields={bankFields}
          displayFields={bankDisplayFields}
          initialForm={bankInitialForm}
          type2={() => 'Bank'}
        />
      )}
    </Box>
  );
}