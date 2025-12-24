import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LoadMask from "./LoadMask";

export default function ParticipantManager({
  title,
  icon: IconComponent,
  apiType,
  fields,
  displayFields,
  subheaderField,
  initialForm,
  type2,
  type3 = "NotApplicable",
}) {
  const [items, setItems] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [menuAnchorEls, setMenuAnchorEls] = useState([]);
  const [newItem, setNewItem] = useState(initialForm);
  const [editItem, setEditItem] = useState(initialForm);

  useEffect(() => {
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
      });
  }, [apiType, title]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewItem(initialForm);
  };

  const handleEditOpen = (idx) => {
    setEditItem(items[idx]);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
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
          throw new Error(`Failed to add ${title.toLowerCase()}`);
        }
        return response.json();
      })
      .then((createdItem) => {
        setItems((prev) => [...prev, createdItem]);
        setMenuAnchorEls((prev) => [...prev, null]);
        handleClose();
      })
      .catch((error) => {
        console.error(`Error adding ${title.toLowerCase()}:`, error);
      });
  };

  const handleEdit = () => {
    // Placeholder for edit API
    console.log("Edit not implemented yet");
    handleEditClose();
  };

  const handleDelete = (idx) => {
    // Placeholder for delete API
    console.log("Delete not implemented yet", idx);
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
              <MenuItem key={option} value={option}>
                {option}
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
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 3, letterSpacing: 1 }}
        >
          {title}
        </Typography>
        <Grid container spacing={3}>
          {items.map((item, idx) => (
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
                        <IconComponent />
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
                      {displayFields.map((df) => (
                        <Typography key={df.name} sx={{ fontSize: 15, color: "grey.700" }}>
                          <b>{df.label}:</b> {item[df.name]}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 5, textAlign: "left", p: 1 }}>
          <Button variant="contained" size="large" onClick={handleOpen}>
            Add {apiType}
          </Button>
        </Box>
        {/* Add Dialog */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add {apiType}</DialogTitle>
          <DialogContent>
            {fields.map((field) => renderField(field, newItem[field.name], handleChange))}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleAdd} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>
        {/* Edit Dialog */}
        <Dialog open={editOpen} onClose={handleEditClose}>
          <DialogTitle>Edit {title.slice(0, -1)}</DialogTitle>
          <DialogContent>
            {fields.map((field) => renderField(field, editItem[field.name], handleEditChange, true))}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleEdit} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        </Box>
    )
}