import React from "react";
import PersonIcon from "@mui/icons-material/Person";
import ParticipantManager from "./ParticipantManager";

const clientTypes = ["Individual", "Company", "Organization"];

const fields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "country", label: "Country", type: "select", options: ["UK", "USA", "India", "Germany", "France", "Ireland"] },
  { name: "type", label: "Type", type: "select", options: clientTypes },
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
  type: "Individual",
};

export default function Clients() {
  return (
    <ParticipantManager
      title="Clients"
      icon={PersonIcon}
      apiType="Client"
      fields={fields}
      displayFields={displayFields}
      subheaderField="type2"
      initialForm={initialForm}
      type2={(item) => item.type}
      type3="NotApplicable"
    />
  );
}
