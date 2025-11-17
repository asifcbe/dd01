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
import PersonIcon from "@mui/icons-material/Person";

const countryList = ["UK", "USA", "India", "Germany", "France", "Ireland"];
const clientTypes = ["Individual", "Company", "Organization"];

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toEditIdx, setToEditIdx] = useState(null);
  const [menuAnchorEls, setMenuAnchorEls] = useState([]);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    country: "",
    mobile: "",
    address: "",
    type: "Individual",
  });
  const [editClient, setEditClient] = useState({
    name: "",
    email: "",
    country: "",
    mobile: "",
    address: "",
    type: "Individual",
  });

  useEffect(() => {
    fetch("api/participants?type1=Client", {
      method: "GET",
    })
      .then((response) => {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        return response.json();
      })
      .then((data) => {
        setClients(data);
        setMenuAnchorEls(Array(data.length).fill(null));
      })
      .catch((error) => {
        console.error("Error fetching clients:", error);
      });
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewClient({
      name: "",
      email: "",
      country: "",
      mobile: "",
      address: "",
      type: "Individual",
    });
  };

  const handleEditOpen = (idx) => {
    setToEditIdx(idx);
    setEditClient(clients[idx]);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setToEditIdx(null);
  };

  const handleChange = (e) => {
    setNewClient((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleEditChange = (e) => {
    setEditClient((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddClient = () => {
    let client = {
      ...newClient,
      type1: "Client",
      type2: newClient.type,
      type3: "NotApplicable",
    };
    fetch("/api/participant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(client),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add client");
        }
        return response.json();
      })
      .then((createdClient) => {
        setClients((prev) => [...prev, createdClient]);
        setMenuAnchorEls((prev) => [...prev, null]);
        handleClose();
      })
      .catch((error) => {
        console.error("Error adding client:", error);
      });
  };

 const handleEditClient = () => {
  // Assume each client has an 'id' field unique identifier
  // const clientId = editClient.email; // Ensure `id` is part of your client data
  // fetch(`/api/participant/${clientId}`, {
  //   method: "PUT",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(editClient),
  //   credentials: "include",
  // })
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw new Error("Failed to update client");
  //     }
  //     return response.json();
  //   })
  //   .then((updatedClient) => {
  //     setClients((prev) =>
  //       prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
  //     );
  //     handleEditClose();
  //   })
  //   .catch((error) => {
  //     console.error("Error updating client:", error);
  //   });
};

const handleDeleteClient = (idx) => {
  // const clientId = clients[idx].email; // Get the ID from clients list
  // fetch(`/api/participant/${clientId}`, {
  //   method: "DELETE",
  //   credentials: "include",
  // })
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw new Error("Failed to delete client");
  //     }
  //     // Remove from local state after successful deletion
  //     setClients((prev) => prev.filter((_, i) => i !== idx));
  //     setMenuAnchorEls((prev) => prev.filter((_, i) => i !== idx));
  //   })
  //   .catch((error) => {
  //     console.error("Error deleting client:", error);
  //   });
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
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", mb: 3, letterSpacing: 1 }}
      >
        Clients
      </Typography>
      <Grid container spacing={3}>
        {clients.map((client, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Fade in>
              <Card
                elevation={4}
                sx={{
                  borderRadius: 3,
                  bgcolor: "#f7fafd",
                  ":hover": { boxShadow: 8, borderColor: "primary.light" },
                  border: "1px solid #f0f2fa",
                  position: "relative",
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
                      <PersonIcon />
                    </Avatar>
                  }
                  title={
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#161d33" }}
                    >
                      {client.name}
                    </Typography>
                  }
                  subheader={client.type2}
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
                      handleDeleteClient(idx);
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
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}>
                      <b>Email:</b> {client.email}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}>
                      <b>Country:</b> {client.country}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}>
                      <b>Mobile:</b> {client.mobile}
                    </Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}>
                      <b>Address:</b> {client.address}
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
          Add Client
        </Button>
      </Box>
      {/* Add Client Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Client</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Name"
            name="name"
            value={newClient.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Email"
            name="email"
            value={newClient.email}
            onChange={handleChange}
          />
          <FormControl margin="normal" fullWidth>
            <InputLabel id="add-country-label">Country</InputLabel>
            <Select
              labelId="add-country-label"
              name="country"
              value={newClient.country}
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
          <FormControl margin="normal" fullWidth>
            <InputLabel id="add-type-label">Type</InputLabel>
            <Select
              labelId="add-type-label"
              name="type"
              value={newClient.type}
              label="Type"
              onChange={handleChange}
            >
              {clientTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label="Mobile"
            name="mobile"
            value={newClient.mobile}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Address"
            name="address"
            value={newClient.address}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddClient} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Client Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Name"
            name="name"
            value={editClient.name}
            onChange={handleEditChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Email"
            name="email"
            value={editClient.email}
            onChange={handleEditChange}
          />
          <FormControl margin="normal" fullWidth>
            <InputLabel id="edit-country-label">Country</InputLabel>
            <Select
              labelId="edit-country-label"
              name="country"
              value={editClient.country}
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
          <FormControl margin="normal" fullWidth>
            <InputLabel id="edit-type-label">Type</InputLabel>
            <Select
              labelId="edit-type-label"
              name="type"
              value={editClient.type}
              label="Type"
              onChange={handleEditChange}
            >
              {clientTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label="Mobile"
            name="mobile"
            value={editClient.mobile}
            onChange={handleEditChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Address"
            name="address"
            value={editClient.address}
            onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditClient} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
