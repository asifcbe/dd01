import React, { useState } from "react";
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
  const [projects, setProjects] = useState([
    { name: "Alpha Project", description: "New business platform", status: "Active", startDate: "2024-01-15", endDate: "2024-06-15" },
    { name: "Beta Launch", description: "Marketing campaign", status: "Planning", startDate: "2024-05-01", endDate: "2024-07-30" },
  ]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toEditIdx, setToEditIdx] = useState(null);
  const [menuAnchorEls, setMenuAnchorEls] = useState(Array(projects.length).fill(null));
  const [newProject, setNewProject] = useState({ name: "", description: "", status: "", startDate: "", endDate: "" });
  const [editProject, setEditProject] = useState({ name: "", description: "", status: "", startDate: "", endDate: "" });

  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); setNewProject({ name: "", description: "", status: "", startDate: "", endDate: "" }); };
  const handleEditOpen = (idx) => { setToEditIdx(idx); setEditProject(projects[idx]); setEditOpen(true); };
  const handleEditClose = () => { setEditOpen(false); setToEditIdx(null); };
  const handleChange = (e) => { setNewProject((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleEditChange = (e) => { setEditProject((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleAddProject = () => { setProjects((prev) => [...prev, newProject]); setMenuAnchorEls((prev) => [...prev, null]); handleClose(); };
  const handleEditProject = () => { setProjects((prev) => prev.map((c, i) => (i === toEditIdx ? editProject : c))); handleEditClose(); };
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
              <Card elevation={4} sx={{ borderRadius: 3, bgcolor: "#fefefe", ":hover": { boxShadow: 8, borderColor: "primary.light" }, border: "1px solid #e6e6e6", position: 'relative' }}>
                <CardHeader
                  avatar={<Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}><AssignmentIcon /></Avatar>}
                  title={<Typography variant="h6" sx={{ fontWeight: "bold", color: "#161d33" }}>{project.name}</Typography>}
                  action={
                    <IconButton onClick={(e) => handleMenuOpen(e, idx)} sx={{ color: "#868ca0" }}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                  sx={{ background: "#f8f8f8", borderBottom: "1px solid #ddd", minHeight: 60 }}
                />
                <Menu anchorEl={menuAnchorEls[idx]} open={Boolean(menuAnchorEls[idx])} onClose={() => handleMenuClose(idx)}>
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
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Description:</b> {project.description}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Status:</b> {project.status}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>Start Date:</b> {project.startDate}</Typography>
                    <Typography sx={{ fontSize: 15, color: "grey.700" }}><b>End Date:</b> {project.endDate}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 5, textAlign: 'left' }}>
        <Button variant="contained" size="large" onClick={handleOpen}>Add Project</Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Project</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={newProject.name} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Description" name="description" value={newProject.description} onChange={handleChange} multiline rows={3} />
          <TextField margin="normal" fullWidth label="Status" name="status" value={newProject.status} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Start Date" name="startDate" value={newProject.startDate} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="End Date" name="endDate" value={newProject.endDate} onChange={handleChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddProject} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={editProject.name} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Description" name="description" value={editProject.description} onChange={handleEditChange} multiline rows={2} />
          <TextField margin="normal" fullWidth label="Status" name="status" value={editProject.status} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Start Date" name="startDate" value={editProject.startDate} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="End Date" name="endDate" value={editProject.endDate} onChange={handleEditChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditProject} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
