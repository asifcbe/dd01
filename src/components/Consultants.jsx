import React from "react";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
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

export default function Consultants() {
  return (
    <ParticipantManager
      title="Consultants"
      icon={EmojiObjectsIcon}
      apiType="Consultant"
      fields={fields}
      displayFields={displayFields}
      initialForm={initialForm}
    />
  );
}
