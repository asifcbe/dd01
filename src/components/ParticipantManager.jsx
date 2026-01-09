import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Fade,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Autocomplete,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import LoadMask from "./LoadMask";

export const COUNTRIES = [
  { name: 'United States', code: 'US', phoneCode: '+1' },
  { name: 'United Kingdom', code: 'GB', phoneCode: '+44' },
  { name: 'India', code: 'India', phoneCode: '+91' },
  { name: 'Germany', code: 'DE', phoneCode: '+49' },
  { name: 'France', code: 'FR', phoneCode: '+33' },
  { name: 'Japan', code: 'JP', phoneCode: '+81' },
  { name: 'Canada', code: 'CA', phoneCode: '+1' },
  { name: 'Australia', code: 'AU', phoneCode: '+61' },
];

export default function ParticipantManager({
  title,
  icon,
  apiType,
  fields,
  displayFields,
  subheaderField,
  initialForm,
  type2,
  type3 = "NotApplicable",
}) {
  const Icon = icon;
  const [items, setItems] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [menuAnchorEls, setMenuAnchorEls] = useState([]);
  const [newItem, setNewItem] = useState(initialForm);
  const [editItem, setEditItem] = useState(initialForm);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [addFields, setAddFields] = useState(fields);
  const [editFields, setEditFields] = useState(fields);
  const filteredItems = items.filter(item =>
    fields.some(field => item[field.name]?.toLowerCase().includes(search.toLowerCase()))
  );

  const fetchItems = useCallback(() => {
    if (apiType === "Bank") {
      // Dummy data for Banks
      const dummyBanks = [
        { id: 1, region: "America", name: "Bank of America", email: "info@boa.com", mobile: "123-456-7890", address: "123 Main St, New York, NY", country: "US", bankCode: "121000358" },
        { id: 2, region: "America", name: "Chase Bank", email: "info@chase.com", mobile: "098-765-4321", address: "456 Elm St, Chicago, IL", country: "US", bankCode: "021000021" },
        { id: 3, region: "India", name: "State Bank of India", email: "info@sbi.com", mobile: "555-123-4567", address: "789 Oak Ave, Mumbai, MH", country: "IN", bankCode: "SBIN0001234" },
      ];
      setItems(dummyBanks);
      setDataLoaded(true);
      setMenuAnchorEls(Array(dummyBanks.length).fill(null));
      return;
    }
    fetch(`api/participants?type1=${apiType}`, {
      method: "GET",
    })
      .then((response) => {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        return response.json();
      })
      .then((data) => {
        setItems(data);
        setDataLoaded(true);
        setMenuAnchorEls(Array(data.length).fill(null));
      })
      .catch((error) => {
        console.error(`Error fetching ${title.toLowerCase()}:`, error);
        setDataLoaded(true);
        setError(error.message);
      });
  }, [apiType, title]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (apiType === "Bank") {
      const updateFields = (item) => {
        return fields.map(field => {
          if (field.name === "bankCode") {
            let label = "Bank Code";
            if (item.region === "India") label = "IFSC Code";
            else if (item.region === "America") label = "Routing Number";
            else if (item.region === "Europe") label = "IBAN";
            return { ...field, label };
          }
          return field;
        });
      };
      setAddFields(updateFields(newItem));
      setEditFields(updateFields(editItem));
    } else {
      setAddFields(fields);
      setEditFields(fields);
    }
  }, [fields, newItem.region, editItem.region, apiType]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewItem(initialForm);
  };

  const handleEditOpen = (idx) => {
    setEditItem(items[idx]);
    setEditOpen(true);
  };  const handleEditClose = () => {
    setEditOpen(false);
  };  const handleClone = (item) => {
    setNewItem({
      ...initialForm,
      ...item,
      name: `${item.name} (Copy)`,
    });
    setOpen(true);
  };

  const handleChange = (e) => {
    setNewItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleEditChange = (e) => {
    setEditItem((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAdd = () => {
    if (apiType === "Bank") {
      const newId = Math.max(...items.map(item => item.id), 0) + 1;
      const itemToAdd = {
        ...newItem,
        id: newId,
        type1: apiType,
        type2: type2 ? type2(newItem) : "NotApplicable",
        type3,
      };
      setItems(prev => [...prev, itemToAdd]);
      handleClose();
      return;
    }
    const itemToAdd = {
      ...newItem,
      type1: apiType,
      type2: type2 ? type2(newItem) : "NotApplicable",
      type3,
    };
    fetch("/api/participant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itemToAdd),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            const errorMsg=err?.detail?.message;
            const msg =Array.isArray(errorMsg) ? errorMsg.map(e => `• ${e}`).join('\n') : errorMsg || `Failed to add ${title.toLowerCase()}`;
            // const msg = err.detail?.message?.join("\n") || `Failed to add ${title.toLowerCase()}`;
            throw new Error(msg);
          });
        }
        return response.json();
      })
      .then(() => {
        fetchItems(); // Refetch to ensure the list is up to date
        handleClose();
      })
      .catch((error) => {
        console.error(`Error adding ${title.toLowerCase()}:`, error);
        setError(error.message);
      });
  };

  const handleEdit = () => {
    if (apiType === "Bank") {
      setItems((prev) =>
        prev.map((item) => (item.id === editItem.id ? editItem : item))
      );
      handleEditClose();
      return;
    }
    fetch(`/api/participant/${editItem.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editItem),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            const msg = Array.isArray(err.detail?.message) ? err.detail?.message?.map(e => `• ${e}`).join("\n") : err.detail?.message || `Failed to update ${title.toLowerCase()}`;
            throw new Error(msg);
          });
        }
        return response.json();
      })
      .then((updatedItem) => {
        setItems((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
        handleEditClose();
      })
      .catch((error) => {
        console.error(`Error updating ${title.toLowerCase()}:`, error);
        setError(error.message);
      });
  };

  const handleDelete = (idx) => {
    if (apiType === "Bank") {
      setItems((prev) => prev.filter((_, i) => i !== idx));
      setMenuAnchorEls((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    const itemToDelete = items[idx];
    fetch(`/api/participant?participant_id=${itemToDelete.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            const msg = Array.isArray(err.detail?.message) ? err.detail?.message?.map(e => `• ${e}`).join("\n") : err.detail?.message || `Failed to delete ${title.toLowerCase()}`;
            throw new Error(msg);
          });
        }
        setItems((prev) => prev.filter((_, i) => i !== idx));
        setMenuAnchorEls((prev) => prev.filter((_, i) => i !== idx));
      })
      .catch((error) => {
        console.error(`Error deleting ${title.toLowerCase()}:`, error);
        setError(error.message);
      });
  };

  const handleMenuOpen = (event, idx) => {
    setMenuAnchorEls((prev) =>
      prev.map((el, i) => (i === idx ? event.currentTarget : el))
    );
  };
  const handleMenuClose = (idx) => {
    setMenuAnchorEls((prev) => prev.map((el, i) => (i === idx ? null : el)));
  };

  const renderField = (field, value, onChange, isEdit = false) => {
    const labelId = `${isEdit ? 'edit' : 'add'}-${field.name}-label`;
    if (field.name === 'mobile') {
      const parts = value.split(' ');
      const countryCode = parts[0] || '';
      const phoneNumber = parts.slice(1).join(' ') || '';
      const selectedCountry = COUNTRIES.find(c => c.phoneCode === countryCode) || null;
      return (
        <Box key={field.name} sx={{ mt: 2, mb: 1 }}>
          <Autocomplete
            options={COUNTRIES}
            getOptionLabel={(option) => `${option.name} (${option.phoneCode})`}
            value={selectedCountry}
            onChange={(event, newValue) => {
              const newCode = newValue ? newValue.phoneCode : '';
              onChange({ target: { name: field.name, value: `${newCode} ${phoneNumber}`.trim() } });
            }}
            renderInput={(params) => <TextField {...params} label="Country" margin="normal" fullWidth />}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TextField
              label="Country Code"
              value={countryCode}
              InputProps={{ readOnly: true }}
              sx={{ width: '30%', mr: 1 }}
              size="small"
            />
            <TextField
              fullWidth
              label={field.label}
              value={phoneNumber}
              onChange={(e) => onChange({ target: { name: field.name, value: `${countryCode} ${e.target.value}` } })}
              inputProps={{ maxLength: 10 }}
            />
          </Box>
        </Box>
      );
    }
    if (field.type === 'autocomplete') {
      return (
        <Autocomplete
          key={field.name}
          options={field.options}
          value={value}
          onChange={(event, newValue) => {
            onChange({ target: { name: field.name, value: newValue || "" } });
          }}
          renderInput={(params) => <TextField {...params} label={field.label} margin="normal" fullWidth />}
        />
      );
    }
    if (field.type === 'select') {
      return (
        <FormControl margin="normal" fullWidth key={field.name}>
          <InputLabel id={labelId}>{field.label}</InputLabel>
          <Select
            labelId={labelId}
            name={field.name}
            value={value}
            label={field.label}
            onChange={onChange}
          >
            {field.options.map((option) => (
              <MenuItem key={option.value || option} value={option.value || option}>
                {option.label || option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    } else {
      return (
        <TextField
          margin="normal"
          fullWidth
          label={field.label}
          name={field.name}
          value={value}
          onChange={onChange}
          key={field.name}
        />
      );
    }
  };

  return (
    !dataLoaded ? <LoadMask text={`Loading ${title}`} /> : <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            {title}
          </Typography>
          <Button variant="contained" size="large" onClick={handleOpen}>Add {apiType}</Button>
        </Box>
        <TextField
          fullWidth
          label={`Search ${title}`}
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Grid container spacing={3}>
          {filteredItems.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx} sx={{ p: 1 }}>
              <Fade in>
                <Card
                  elevation={4}
                  sx={{
                    borderRadius: 3,
                    bgcolor: "#f7fafc",
                    ":hover": { boxShadow: 8, borderColor: "primary.light" },
                    border: "1px solid #f0f2fa",
                    position: "relative",
                    width: '300px',
                  }}
                >
                  <CardHeader
                    avatar={
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          mr: 1,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <Icon />
                      </Avatar>
                    }
                    title={
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", color: "#161d33" }}
                      >
                        {item.name}
                      </Typography>
                    }
                    subheader={subheaderField ? item[subheaderField] : undefined}
                    action={
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, idx)}
                        sx={{ color: "#868ca0" }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    }
                    sx={{
                      background: "#f0f2fa",
                      borderBottom: "1px solid #e0e2ea",
                      minHeight: 60,
                    }}
                  />
                  <Menu
                    anchorEl={menuAnchorEls[idx]}
                    open={Boolean(menuAnchorEls[idx])}
                    onClose={() => handleMenuClose(idx)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleEditOpen(idx);
                        handleMenuClose(idx);
                      }}
                    >
                      <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleClone(filteredItems[idx]);
                        handleMenuClose(idx);
                      }}
                    >
                      <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} /> Clone
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDelete(idx);
                        handleMenuClose(idx);
                      }}
                    >
                      <DeleteIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "#f44336" }}
                      />{" "}
                      Delete
                    </MenuItem>
                  </Menu>
                  <Divider sx={{ mb: 2, mt: 0 }} />
                  <CardContent>
                    <Box sx={{ display: "grid", gap: 1 }}>
                      {displayFields.map((df) => {
                        let displayLabel = df.label;
                        if (apiType === "Bank" && df.name === "bankCode") {
                          if (item.region === "India") displayLabel = "IFSC Code";
                          else if (item.region === "America") displayLabel = "Routing Number";
                          else if (item.region === "Europe") displayLabel = "IBAN";
                        }
                        return (
                          <Typography key={df.name} sx={{ fontSize: 15, color: "grey.700" }}>
                            <b>{displayLabel}:</b> {item[df.name]}
                          </Typography>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
        {/* <Box sx={{ mt: 5, textAlign: "left", p: 1 }}>
          <Button variant="contained" size="large" onClick={handleOpen}>
            Add {apiType}
          </Button>
        </Box> */}
        {/* Add Dialog */}
        <Dialog open={open} onClose={() => {}} disableEscapeKeyDown={true}>
          <DialogTitle>Add {apiType}</DialogTitle>
          <DialogContent>
            {addFields.map((field) => renderField(field, newItem[field.name], handleChange))}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAdd} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>
        {/* Edit Dialog */}
        <Dialog open={editOpen} onClose={() => {}} disableEscapeKeyDown={true}>
          <DialogTitle>Edit {title.slice(0, -1)}</DialogTitle>
          <DialogContent>
            {editFields.map((field) => renderField(field, editItem[field.name], handleEditChange, true))}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleEdit} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            variant="filled"
            sx={{
              width: "100%",
              maxWidth: 600,
              fontSize: "1rem",
              fontWeight: 500,
              boxShadow: 3,
              borderRadius: 2,
              whiteSpace: 'pre-wrap',
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    )
}