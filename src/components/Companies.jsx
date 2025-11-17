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
import BusinessIcon from "@mui/icons-material/Business";

const countryList = ["UK", "USA", "India", "Germany", "France", "Ireland"];

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toEditIdx, setToEditIdx] = useState(null);
  const [menuAnchorEls, setMenuAnchorEls] = useState([]);
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    country: "",
    mobile: "",
    address: "",
  });
  const [editCompany, setEditCompany] = useState({
    name: "",
    email: "",
    country: "",
    mobile: "",
    address: "",
  });

  useEffect(() => {
    fetch("api/participants?type1=Company", { method: "GET" })
      .then((response) => {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        return response.json();
      })
      .then((data) => {
        setCompanies(data);
        setMenuAnchorEls(Array(data.length).fill(null));
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
      });
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewCompany({ name: "", email: "", country: "", mobile: "", address: "" });
  };

  const handleEditOpen = (idx) => {
    setToEditIdx(idx);
    setEditCompany(companies[idx]);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setToEditIdx(null);
  };

  const handleChange = (e) => {
    setNewCompany((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleEditChange = (e) => {
    setEditCompany((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddCompany = () => {
    setCompanies((prev) => [...prev, newCompany]);
    setMenuAnchorEls((prev) => [...prev, null]);
    handleClose();
  };

  const handleEditCompany = () => {
    setCompanies((prev) =>
      prev.map((c, i) => (i === toEditIdx ? editCompany : c))
    );
    handleEditClose();
  };

  const handleDeleteCompany = (idx) => {
    setCompanies((prev) => prev.filter((_, i) => i !== idx));
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
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3, letterSpacing: 1 }}>
        Companies
      </Typography>
      <Grid container spacing={3}>
        {companies.map((company, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Fade in>
              <Card
                elevation={4}
                sx={{
                  borderRadius: 3,
                  bgcolor: "#f7fafc",
                  ":hover": { boxShadow: 8, borderColor: "primary.light" },
                  border: "1px solid #f0f2fa",
                  position: "relative",
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main", mr: 1, width: 40, height: 40 }}>
                      <BusinessIcon />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#161d33" }}>
                      {company.name}
                    </Typography>
                  }
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
                  <MenuItem onClick={() => { handleEditOpen(idx); handleMenuClose(idx); }}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                  </MenuItem>
                  <MenuItem onClick={() => { handleDeleteCompany(idx); handleMenuClose(idx); }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1, color: "#f44336" }} /> Delete
                  </MenuItem>
                </Menu>
                <Divider sx={{ mb: 2, mt: 0 }} />
                <CardContent>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}>
                      <b>Email:</b> {company.email}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}>
                      <b>Country:</b> {company.country}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}>
                      <b>Mobile:</b> {company.mobile}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}>
                      <b>Address:</b> {company.address}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 5, textAlign: "left" }}>
        <Button variant="contained" size="large" onClick={handleOpen}>
          Add Company
        </Button>
      </Box>

      {/* Add Company Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Company</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={newCompany.name} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Email" name="email" value={newCompany.email} onChange={handleChange} />
          <FormControl margin="normal" fullWidth>
            <InputLabel id="add-country-label">Country</InputLabel>
            <Select
              labelId="add-country-label"
              name="country"
              value={newCompany.country}
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
          <TextField margin="normal" fullWidth label="Mobile" name="mobile" value={newCompany.mobile} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Address" name="address" value={newCompany.address} onChange={handleChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddCompany} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Company</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={editCompany.name} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Email" name="email" value={editCompany.email} onChange={handleEditChange} />
          <FormControl margin="normal" fullWidth>
            <InputLabel id="edit-country-label">Country</InputLabel>
            <Select
              labelId="edit-country-label"
              name="country"
              value={editCompany.country}
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
          <TextField margin="normal" fullWidth label="Mobile" name="mobile" value={editCompany.mobile} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Address" name="address" value={editCompany.address} onChange={handleEditChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditCompany} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
