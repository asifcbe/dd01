import React, { useState, useEffect } from "react";
import {
  Box, Button, Card, CardContent, CardHeader, IconButton, Typography, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu, MenuItem,
  Fade, Avatar, Divider
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/AssignmentTurnedIn";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toEditIdx, setToEditIdx] = useState(null);
  const [menuAnchorEls, setMenuAnchorEls] = useState([]);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    given_by: "",
    taken_by: "",
    start_date: "",
    end_date: "",
    rate_mode: "",
    rate_amount: "",
    currency: ""
  });
  const [editProject, setEditProject] = useState({
    name: "",
    description: "",
    given_by: "",
    taken_by: "",
    start_date: "",
    end_date: "",
    rate_mode: "",
    rate_amount: "",
    currency: ""
  });

  useEffect(() => {
    fetch("api/projects", { method: "GET" })
      .then((response) => {
        if (response.status === 401) throw new Error("Unauthorized");
        return response.json();
      })
      .then((data) => {
        setProjects(data);
        setMenuAnchorEls(Array(data.length).fill(null));
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewProject({
      name: "",
      description: "",
      given_by: "",
      taken_by: "",
      start_date: "",
      end_date: "",
      rate_mode: "",
      rate_amount: "",
      currency: ""
    });
  };
  const handleEditOpen = (idx) => {
    setToEditIdx(idx);
    setEditProject(projects[idx]);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setToEditIdx(null);
  };
  const handleChange = (e) => { setNewProject((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleEditChange = (e) => { setEditProject((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleAddProject = () => { setProjects((prev) => [...prev, newProject]); setMenuAnchorEls((prev) => [...prev, null]); handleClose(); };
  const handleEditProject = () => { setProjects((prev) => prev.map((p, i) => (i === toEditIdx ? editProject : p))); handleEditClose(); };
  const handleDeleteProject = (idx) => { setProjects((prev) => prev.filter((_, i) => i !== idx)); setMenuAnchorEls((prev) => prev.filter((_, i) => i !== idx)); };
  const handleMenuOpen = (event, idx) => { setMenuAnchorEls((prev) => prev.map((el, i) => (i === idx ? event.currentTarget : el))); };
  const handleMenuClose = (idx) => { setMenuAnchorEls((prev) => prev.map((el, i) => (i === idx ? null : el))); };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>Projects</Typography>
      <Grid container spacing={3}>
        {projects.map((project, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Fade in>
              <Card elevation={4} sx={{
                borderRadius: 3,
                bgcolor: "#f6f8fa",
                ":hover": { boxShadow: 8, borderColor: "primary.light" },
                border: "1px solid #f0f2fa",
                position: "relative"
              }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                      <AssignmentIcon />
                    </Avatar>
                  }
                  title={
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#161d33" }}>
                      {project.name}
                    </Typography>
                  }
                  action={
                    <IconButton onClick={(e) => handleMenuOpen(e, idx)} sx={{ color: "#868ca0" }}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                  sx={{
                    background: "#f0f2fa", borderBottom: "1px solid #e0e2ea", minHeight: 60
                  }}
                />
                <Menu anchorEl={menuAnchorEls[idx]} open={Boolean(menuAnchorEls[idx])} onClose={() => handleMenuClose(idx)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}>
                  <MenuItem onClick={() => { handleEditOpen(idx); handleMenuClose(idx); }}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                  </MenuItem>
                  <MenuItem onClick={() => { handleDeleteProject(idx); handleMenuClose(idx); }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1, color: "#f44336" }} /> Delete
                  </MenuItem>
                </Menu>
                <Divider sx={{ mb: 2, mt: 0 }} />
                <CardContent>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Description:</b> {project.description ?? "None"}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Given By:</b> {project.given_by}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Taken By:</b> {project.taken_by}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Start Date:</b> {project.start_date}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>End Date:</b> {project.end_date}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Rate Mode:</b> {project.rate_mode}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Rate Amount:</b> {project.rate_amount}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Currency:</b> {project.currency}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 5, textAlign: "left" }}>
        <Button variant="contained" size="large" onClick={handleOpen}>Add Project</Button>
      </Box>
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={editProject.name} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Description" name="description" value={editProject.description} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Given By" name="given_by" value={editProject.given_by} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Taken By" name="taken_by" value={editProject.taken_by} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Start Date" name="start_date" value={editProject.start_date} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="End Date" name="end_date" value={editProject.end_date} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Rate Mode" name="rate_mode" value={editProject.rate_mode} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Rate Amount" name="rate_amount" value={editProject.rate_amount} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Currency" name="currency" value={editProject.currency} onChange={handleEditChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditProject} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
