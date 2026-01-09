import React, { useState } from "react";
import {
  Business as CompaniesIcon,
  AccountBalance as BanksIcon
} from "@mui/icons-material";
import { Tabs, Tab, Box } from "@mui/material";
import ParticipantManager from "./ParticipantManager";


const companyFields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "address", label: "Address", type: "text" }];

const companyDisplayFields = [
  { name: "email", label: "Email" },
  { name: "mobile", label: "Mobile" },
  { name: "address", label: "Address" },
  { name: "country", label: "Country" },
];

const companyInitialForm = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  country: "",
};

const bankFields = [
  { name: "region", label: "Region", type: "select", options: ["India", "America", "Europe"] },
  { name: "bankCode", label: "Bank Code", type: "text" },
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "address", label: "Address", type: "text" },
];

const bankDisplayFields = [
  { name: "region", label: "Region" },
  { name: "bankCode", label: "Bank Code" },
  { name: "email", label: "Email" },
  { name: "mobile", label: "Mobile" },
  { name: "address", label: "Address" },
];

const bankInitialForm = {
  region: "",
  name: "",
  email: "",
  mobile: "",
  address: "",
  country: "",
  bankCode: "",
};

export default function Companies() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="companies and banks tabs">
        <Tab label="Companies" />
        <Tab label="Banks" />
      </Tabs>
      {tabValue === 0 && (
        <ParticipantManager
          title="Companies"
          icon={CompaniesIcon}
          apiType="Company"
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
          fields={bankFields}
          displayFields={bankDisplayFields}
          initialForm={bankInitialForm}
          type2={() => 'Bank'}
        />
      )}
    </Box>
  );
}
