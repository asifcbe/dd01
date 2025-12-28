import React, { useState, useEffect } from "react";
import {
  Box, Button, Card, CardContent, CardHeader, IconButton, Typography, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Menu, MenuItem,
  Fade, Avatar, Divider, FormControl, InputLabel, Select, Snackbar, Alert
} from "@mui/material";
import {
  Assignment as ProjectsIcon
} from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LoadMask from "./LoadMask";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toEditIdx, setToEditIdx] = useState(null);
  const [menuAnchorEls, setMenuAnchorEls] = useState([]);
  const [error, setError] = useState(null);
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
        setDataLoaded(true);
        setMenuAnchorEls(Array(data.length).fill(null));
      })
      .catch((error) => {
        setDataLoaded(true);
        console.error("Error fetching projects:", error);
      });

    fetch("api/participants", { method: "GET" })
      .then((response) => {
        if (response.status === 401) throw new Error("Unauthorized");
        return response.json();
      })
      .then((data) => {
        setParticipants(data);
      })
      .catch((error) => {
        console.error("Error fetching participants:", error);
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
    const project = projects[idx];
    const givenByParticipant = participants.find(p => p.name === project.given_by);
    const takenByParticipant = participants.find(p => p.name === project.taken_by);
    setEditProject({
      ...project,
      given_by: givenByParticipant ? givenByParticipant.id : "",
      taken_by: takenByParticipant ? takenByParticipant.id : "",
    });
    setToEditIdx(idx);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setToEditIdx(null);
  };
  const handleChange = (e) => { setNewProject((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleEditChange = (e) => { setEditProject((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleAddProject = () => {
    fetch("/api/project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProject),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            const msg = err.detail?.message?.join(" ") || "Failed to add project";
            throw new Error(msg);
          });
        }
        return response.json();
      })
      .then(() => {
        // Refetch projects to ensure the list is up to date with names
        fetch("api/projects", { method: "GET" })
          .then((response) => response.json())
          .then((data) => {
            setProjects(data);
            setMenuAnchorEls(Array(data.length).fill(null));
            handleClose();
          })
          .catch((error) => {
            console.error("Error refetching projects:", error);
            handleClose();
          });
      })
      .catch((error) => {
        console.error("Error adding project:", error);
        setError(error.message);
      });
  };
  const handleEditProject = () => {
    fetch(`/api/project/${editProject.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editProject),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            const msg = err.detail?.message?.join(" ") || "Failed to update project";
            throw new Error(msg);
          });
        }
        return response.json();
      })
      .then((updatedProject) => {
        setProjects((prev) =>
          prev.map((p, i) => (i === toEditIdx ? updatedProject : p))
        );
        handleEditClose();
      })
      .catch((error) => {
        console.error("Error updating project:", error);
        setError(error.message);
      });
  };
  const handleDeleteProject = (idx) => {
    const projectToDelete = projects[idx];
    fetch(`/api/project?project_id=${projectToDelete.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            const msg = err.detail?.message?.join(" ") || "Failed to delete project";
            throw new Error(msg);
          });
        }
        setProjects((prev) => prev.filter((_, i) => i !== idx));
        setMenuAnchorEls((prev) => prev.filter((_, i) => i !== idx));
      })
      .catch((error) => {
        console.error("Error deleting project:", error);
        setError(error.message);
      });
  };
  const handleMenuOpen = (event, idx) => { setMenuAnchorEls((prev) => prev.map((el, i) => (i === idx ? event.currentTarget : el))); };
  const handleMenuClose = (idx) => { setMenuAnchorEls((prev) => prev.map((el, i) => (i === idx ? null : el))); };

  return (
    !dataLoaded ? <LoadMask text='Loading Projects' /> : <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>Projects</Typography>
      <Grid container spacing={3} >
        {projects.map((project, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx} sx={{ p: 1 }}>
            <Fade in>
              <Card elevation={4} sx={{
                borderRadius: 3,
                bgcolor: "#f6f8fa",
                ":hover": { boxShadow: 8, borderColor: "primary.light" },
                border: "1px solid #f0f2fa",
                position: "relative",
                width:'300px',
              }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                      <ProjectsIcon />
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
      <Box sx={{ mt: 5, textAlign: "left" ,p: 1}}>
        <Button variant="contained" size="large" onClick={handleOpen}>Add Project</Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Project</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={newProject.name} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Description" name="description" value={newProject.description} onChange={handleChange} />
          <FormControl margin="normal" fullWidth>
            <InputLabel>Given By</InputLabel>
            <Select
              name="given_by"
              value={newProject.given_by}
              label="Given By"
              onChange={handleChange}
            >
              {participants.map((participant) => (
                <MenuItem key={participant.id} value={participant.id}>
                  {participant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl margin="normal" fullWidth>
            <InputLabel>Taken By</InputLabel>
            <Select
              name="taken_by"
              value={newProject.taken_by}
              label="Taken By"
              onChange={handleChange}
            >
              {participants.map((participant) => (
                <MenuItem key={participant.id} value={participant.id}>
                  {participant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField margin="normal" fullWidth label="Start Date" name="start_date" type="date" value={newProject.start_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField margin="normal" fullWidth label="End Date" name="end_date" type="date" value={newProject.end_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <FormControl margin="normal" fullWidth>
            <InputLabel>Rate Mode</InputLabel>
            <Select
              name="rate_mode"
              value={newProject.rate_mode}
              label="Rate Mode"
              onChange={handleChange}
            >
              <MenuItem value="Hourly">Hourly</MenuItem>
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Milestone">Milestone</MenuItem>
              <MenuItem value="Fixed">Fixed</MenuItem>
            </Select>
          </FormControl>
          <TextField margin="normal" fullWidth label="Rate Amount" name="rate_amount" value={newProject.rate_amount} onChange={handleChange} />
          <TextField margin="normal" fullWidth label="Currency" name="currency" value={newProject.currency} onChange={handleChange} />
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
          <TextField margin="normal" fullWidth label="Description" name="description" value={editProject.description} onChange={handleEditChange} />
          <FormControl margin="normal" fullWidth>
            <InputLabel>Given By</InputLabel>
            <Select
              name="given_by"
              value={editProject.given_by}
              label="Given By"
              onChange={handleEditChange}
            >
              {participants.map((participant) => (
                <MenuItem key={participant.id} value={participant.id}>
                  {participant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl margin="normal" fullWidth>
            <InputLabel>Taken By</InputLabel>
            <Select
              name="taken_by"
              value={editProject.taken_by}
              label="Taken By"
              onChange={handleEditChange}
            >
              {participants.map((participant) => (
                <MenuItem key={participant.id} value={participant.id}>
                  {participant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField margin="normal" fullWidth label="Start Date" name="start_date" type="date" value={editProject.start_date} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
          <TextField margin="normal" fullWidth label="End Date" name="end_date" type="date" value={editProject.end_date} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
          <FormControl margin="normal" fullWidth>
            <InputLabel>Rate Mode</InputLabel>
            <Select
              name="rate_mode"
              value={editProject.rate_mode}
              label="Rate Mode"
              onChange={handleEditChange}
            >
              <MenuItem value="Hourly">Hourly</MenuItem>
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Milestone">Milestone</MenuItem>
              <MenuItem value="Fixed">Fixed</MenuItem>
            </Select>
          </FormControl>
          <TextField margin="normal" fullWidth label="Rate Amount" name="rate_amount" value={editProject.rate_amount} onChange={handleEditChange} />
          <TextField margin="normal" fullWidth label="Currency" name="currency" value={editProject.currency} onChange={handleEditChange} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditProject} variant="contained">Save</Button>
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
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}