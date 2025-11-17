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
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const countryList = ["UK", "USA", "India", "Germany", "France", "Ireland"];

export default function Consultants() {
  const [consultants, setConsultants] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toEditIdx, setToEditIdx] = useState(null);
  const [menuAnchorEls, setMenuAnchorEls] = useState([]);

  const [newConsultant, setNewConsultant] = useState({
    name: "",
    email: "",
    country: "",
    mobile: "",
    address: "",
  });
  const [editConsultant, setEditConsultant] = useState({
    name: "",
    email: "",
    country: "",
    mobile: "",
    address: "",
  });

  useEffect(() => {
    fetch("api/participants?type1=Consultant", { method: "GET" })
      .then((response) => {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        return response.json();
      })
      .then((data) => {
        setConsultants(data);
        setMenuAnchorEls(Array(data.length).fill(null));
      })
      .catch((error) => {
        console.error("Error fetching consultants:", error);
      });
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewConsultant({
      name: "",
      email: "",
      country: "",
      mobile: "",
      address: "",
    });
  };

  const handleEditOpen = (idx) => {
    setToEditIdx(idx);
    setEditConsultant(consultants[idx]);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setToEditIdx(null);
  };

  const handleChange = (e) => {
    setNewConsultant((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleEditChange = (e) => {
    setEditConsultant((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddConsultant = () => {
    setConsultants((prev) => [...prev, newConsultant]);
    setMenuAnchorEls((prev) => [...prev, null]);
    handleClose();
  };

  const handleEditConsultant = () => {
    setConsultants((prev) =>
      prev.map((c, i) => (i === toEditIdx ? editConsultant : c))
    );
    handleEditClose();
  };

  const handleDeleteConsultant = (idx) => {
    setConsultants((prev) => prev.filter((_, i) => i !== idx));
    setMenuAnchorEls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMenuOpen = (event, idx) => {
    setMenuAnchorEls((prev) =>
      prev.map((el, i) => (i === idx ? event.currentTarget : el))
    );
  };
  const handleMenuClose = (idx) => {
    setMenuAnchorEls((prev) => prev.map((el, i) => (i === idx ? null : el)));
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Consultants
      </Typography>
      <Grid container spacing={3}>
        {consultants.map((consultant, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Fade in>
              <Card
                elevation={4}
                sx={{
                  borderRadius: 3,
                  bgcolor: "#fbfcfd",
                  ":hover": { boxShadow: 8, borderColor: "primary.light" },
                  border: "1px solid #e9ecf0",
                  position: "relative",
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                      <EmojiObjectsIcon />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#161d33" }}>
                      {consultant.name}
                    </Typography>
                  }
                  action={
                    <IconButton onClick={(e) => handleMenuOpen(e, idx)} sx={{ color: "#868ca0" }}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                  sx={{
                    background: "#f0f2fa",
                    borderBottom: "1px solid #e5e7eb",
                    minHeight: 60,
                  }}
                />
                <Menu
                  anchorEl={menuAnchorEls[idx]}
                  open={Boolean(menuAnchorEls[idx])}
                  onClose={() => handleMenuClose(idx)}
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
                      handleDeleteConsultant(idx);
                      handleMenuClose(idx);
                    }}
                  >
                    <DeleteIcon fontSize="small" sx={{ mr: 1, color: "#f44336" }} />
                    Delete
                  </MenuItem>
                </Menu>
                <Divider sx={{ mb: 2, mt: 0 }} />
                <CardContent>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Email:</b> {consultant.email}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Country:</b> {consultant.country}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Mobile:</b> {consultant.mobile}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Address:</b> {consultant.address}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 5, textAlign: "left" }}>
        <Button variant="contained" size="large" onClick={handleOpen}>
          Add Consultant
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Consultant</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={newConsultant.name} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Email" name="email" value={newConsultant.email} onChange={handleChange} />
          <FormControl fullWidth margin="normal">
            <InputLabel id="add-country-label">Country</InputLabel>
            <Select
              labelId="add-country-label"
              name="country"
              value={newConsultant.country}
              label="Country"
              onChange={handleChange}
            >
              {countryList.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField margin="normal" fullWidth label="Mobile" name="mobile" value={newConsultant.mobile} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Address" name="address" value={newConsultant.address} onChange={handleChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddConsultant} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Consultant</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={editConsultant.name} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Email" name="email" value={editConsultant.email} onChange={handleEditChange} />
          <FormControl fullWidth margin="normal">
            <InputLabel id="edit-country-label">Country</InputLabel>
            <Select
              labelId="edit-country-label"
              name="country"
              value={editConsultant.country}
              label="Country"
              onChange={handleEditChange}
            >
              {countryList.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField margin="normal" fullWidth label="Mobile" name="mobile" value={editConsultant.mobile} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Address" name="address" value={editConsultant.address} onChange={handleEditChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditConsultant} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
