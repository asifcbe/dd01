import {
  Engineering as ConsultantsIcon
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

export default function Consultants() {
  return (
    <ParticipantManager
      title="Consultants"
      icon={ConsultantsIcon}
      apiType="Consultant"
      apiDetailType="consultants"
      apiDetailTypeSingle="consultant"
      fields={fields}
      displayFields={displayFields}
      initialForm={initialForm}
      type2={()=>'Individual'}
    />  
  );
}
