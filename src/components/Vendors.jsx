import React from "react";
import {
  Store as VendorsIcon
} from "@mui/icons-material";
import ParticipantManager from "./ParticipantManager";

const fields = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "mobile", label: "Mobile", type: "text" },
  { name: "address", label: "Address", type: "text" },
];

const displayFields = [
  { name: "email", label: "Email" },
  { name: "mobile", label: "Mobile" },
  { name: "address", label: "Address" },
];

const initialForm = {
  name: "",
  email: "",
  mobile: "",
  address: "",
};

export default function Vendors() {
  return (
    <ParticipantManager
      title="Vendors"
      icon={VendorsIcon}
      apiType="Vendor"
      fields={fields}
      displayFields={displayFields}
      initialForm={initialForm}
      type2={()=>'Company'}
    />
  );
}
