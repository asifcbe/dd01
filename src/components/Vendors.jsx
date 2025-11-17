import React, { useState, useEffect } from "react";
import {
  Box, Button, Card, CardContent, CardHeader, IconButton, Typography, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu, MenuItem,
  Fade, Avatar, Divider, FormControl, InputLabel, Select
} from "@mui/material";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const countryList = ["UK", "USA", "India", "Germany", "France", "Ireland"];

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toEditIdx, setToEditIdx] = useState(null);
  const [menuAnchorEls, setMenuAnchorEls] = useState([]);
  const [newVendor, setNewVendor] = useState({ name: "", email: "", country: "", mobile: "", address: "" });
  const [editVendor, setEditVendor] = useState({ name: "", email: "", country: "", mobile: "", address: "" });

  useEffect(() => {
    fetch("api/participants?type1=Vendor", { method: "GET" })
      .then(response => {
        if (response.status === 401) throw new Error("Unauthorized");
        return response.json();
      })
      .then(data => {
        setVendors(data);
        setMenuAnchorEls(Array(data.length).fill(null));
      })
      .catch(error => {
        console.error("Error fetching vendors:", error);
      });
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewVendor({ name: "", email: "", country: "", mobile: "", address: "" });
  };

  const handleEditOpen = (idx) => {
    setToEditIdx(idx);
    setEditVendor(vendors[idx]);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setToEditIdx(null);
  };

  const handleChange = (e) => {
    setNewVendor(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleEditChange = (e) => {
    setEditVendor(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddVendor = () => {
    setVendors(prev => [...prev, newVendor]);
    setMenuAnchorEls(prev => [...prev, null]);
    handleClose();
  };

  const handleEditVendor = () => {
    setVendors(prev => prev.map((v, i) => (i === toEditIdx ? editVendor : v)));
    handleEditClose();
  };

  const handleDeleteVendor = (idx) => {
    setVendors(prev => prev.filter((_, i) => i !== idx));
    setMenuAnchorEls(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMenuOpen = (event, idx) => {
    setMenuAnchorEls(prev => prev.map((el, i) => (i === idx ? event.currentTarget : el)));
  };
  const handleMenuClose = (idx) => {
    setMenuAnchorEls(prev => prev.map((el, i) => (i === idx ? null : el)));
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>Vendors</Typography>
      <Grid container spacing={3}>
        {vendors.map((vendor, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Fade in>
              <Card elevation={4} sx={{
                borderRadius: 3, bgcolor: "#f7fafc", ":hover": { boxShadow: 8, borderColor: "primary.light" },
                border: "1px solid #f0f2fa", position: 'relative'
              }}>
                <CardHeader
                  avatar={<Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}><LocalMallIcon /></Avatar>}
                  title={<Typography variant="h6" sx={{ fontWeight: "bold", color: "#161d33" }}>{vendor.name}</Typography>}
                  action={
                    <IconButton onClick={(e) => handleMenuOpen(e, idx)} sx={{ color: "#868ca0" }}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                  sx={{ background: "#f0f2fa", borderBottom: "1px solid #e0e2ea", minHeight: 60 }}
                />
                <Menu anchorEl={menuAnchorEls[idx]} open={Boolean(menuAnchorEls[idx])} onClose={() => handleMenuClose(idx)}>
                  <MenuItem onClick={() => { handleEditOpen(idx); handleMenuClose(idx); }}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                  </MenuItem>
                  <MenuItem onClick={() => { handleDeleteVendor(idx); handleMenuClose(idx); }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1, color: "#f44336" }} /> Delete
                  </MenuItem>
                </Menu>
                <Divider sx={{ mb: 2, mt: 0 }} />
                <CardContent>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Email:</b> {vendor.email}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Country:</b> {vendor.country}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Mobile:</b> {vendor.mobile}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Address:</b> {vendor.address}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 5, textAlign: 'left' }}>
        <Button variant="contained" size="large" onClick={handleOpen}>Add Vendor</Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Vendor</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={newVendor.name} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Email" name="email" value={newVendor.email} onChange={handleChange} />
          <FormControl fullWidth margin="normal">
            <InputLabel id="add-country-label">Country</InputLabel>
            <Select
              labelId="add-country-label"
              name="country"
              value={newVendor.country}
              label="Country"
              onChange={handleChange}
            >
              {countryList.map(country => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField margin="normal" fullWidth label="Mobile" name="mobile" value={newVendor.mobile} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Address" name="address" value={newVendor.address} onChange={handleChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddVendor} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Vendor</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={editVendor.name} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Email" name="email" value={editVendor.email} onChange={handleEditChange} />
          <FormControl fullWidth margin="normal">
            <InputLabel id="edit-country-label">Country</InputLabel>
            <Select
              labelId="edit-country-label"
              name="country"
              value={editVendor.country}
              label="Country"
              onChange={handleEditChange}
            >
              {countryList.map(country => (
                <MenuItem key={country} value={country}>{country}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField margin="normal" fullWidth label="Mobile" name="mobile" value={editVendor.mobile} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Address" name="address" value={editVendor.address} onChange={handleEditChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditVendor} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
