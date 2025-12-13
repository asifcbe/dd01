import React from "react";
import BusinessIcon from "@mui/icons-material/Business";
import ParticipantManager from "./ParticipantManager";

const fields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "country", label: "Country", type: "select", options: ["UK", "USA", "India", "Germany", "France", "Ireland"] },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "address", label: "Address", type: "text" },
];

const displayFields = [
  { name: "email", label: "Email" },
  { name: "country", label: "Country" },
  { name: "mobile", label: "Mobile" },
  { name: "address", label: "Address" },
];

const initialForm = {
  name: "",
  email: "",
  country: "",
  mobile: "",
  address: "",
};

export default function Companies() {
  return (
    <ParticipantManager
      title="Companies"
      icon={BusinessIcon}
      apiType="Company"
      fields={fields}
      displayFields={displayFields}
      initialForm={initialForm}
    />
  );
}
