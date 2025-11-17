import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

// Converter: Mermaid-style script to ReactFlow nodes/edges for neat tree
function mermaidToReactFlow(scriptArr) {
  const edgeRegex = /(\d+)\((\d+):([^)]+)\)\s*--\s*ProjectId:(\d+)\s*-->\s*(\d+)\((\d+):([^)]+)\)/;
  const nodeMap = {};
  const edgeArr = [];
  scriptArr.forEach((line) => {
    if (line.startsWith("graph")) return;
    const match = edgeRegex.exec(line);
    if (match) {
      const leftId = match[1];
      const leftLabel = match[3];
      nodeMap[leftId] = leftLabel;
      const rightId = match[5];
      const rightLabel = match[7];
      nodeMap[rightId] = rightLabel;
      edgeArr.push({
        id: `e${leftId}-${rightId}`,
        source: leftId,
        target: rightId,
        label: `ProjectId:${match[4]}`,
        type: "smoothstep",
      });
    }
  });

  // Find roots (no incoming edges)
  const roots = Object.keys(nodeMap).filter(
    (id) => !edgeArr.some((edge) => edge.target === id)
  );
  const levels = {};
  const placed = {};
  function traverse(id, level = 0) {
    if (placed[id]) return;
    placed[id] = true;
    levels[level] = levels[level] || [];
    levels[level].push(id);
    edgeArr
      .filter((edge) => edge.source === id)
      .forEach((edge, i) => traverse(edge.target, level + 1));
  }
  roots.forEach((rootId, i) => traverse(rootId, 0, i));
  const nodeList = [];
  Object.entries(levels).forEach(([lev, ids]) => {
    ids.forEach((id, x) => {
      nodeList.push({
        id: id,
        position: { x: 300 * x + 100, y: 120 * lev + 20 },
        data: { label: `${id}:${nodeMap[id]}` },
        style: { border: "2px solid #b0b6e3", borderRadius: 10 },
      });
    });
  });
  return { nodes: nodeList, edges: edgeArr };
}

export default function Templates() {
  const [tabIdx, setTabIdx] = useState(0);
  const [templateListObj, setTemplateListObj] = useState({});
  const [templateList, setTemplateList] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [menuAnchors, setMenuAnchors] = useState({});

  useEffect(() => {
    fetch("api/templates", { method: "GET" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch templates");
        return res.json();
      })
      .then((data) => {
        setTemplateListObj(data);
        setTemplateList(Object.values(data));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedTemplateId) return;
    fetch(`api/template/tree-view?template_id=${selectedTemplateId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch tree data");
        return res.json();
      })
      .then((data) => {
        const { nodes, edges } = mermaidToReactFlow(data.script);
        setNodes(nodes);
        setEdges(edges);
        setTabIdx(1);
      })
      .catch(console.error);
  }, [selectedTemplateId]);

  // Menu handlers
  const handleMenuOpen = (event, templateId) => {
    setMenuAnchors((prev) => ({ ...prev, [templateId]: event.currentTarget }));
  };
  const handleMenuClose = (templateId) => {
    setMenuAnchors((prev) => ({ ...prev, [templateId]: null }));
  };

  // Placeholder edit/delete logic
  const handleEditTemplate = (templateId) => {
    alert(`Edit Template ${templateId}`);
    handleMenuClose(templateId);
  };
  const handleDeleteTemplate = (templateId) => {
    alert(`Delete Template ${templateId}`);
    handleMenuClose(templateId);
  };

  return (
    <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>Templates</Typography>
      <Tabs value={tabIdx} onChange={(_, v) => setTabIdx(v)} sx={{ mb: 2 }}>
        <Tab label="List Templates" />
        <Tab label="Tree View" disabled={!selectedTemplateId} />
      </Tabs>
      {tabIdx === 0 && (
        <Grid container spacing={4} >
          {templateList.map((template) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={template.id}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Card
                elevation={4}
                sx={{
                  width: 370,
                  maxWidth: "100%",
                  minHeight: 320,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: 5,
                  p: 0,
                  mx: "auto",
                }}
              >
                <CardHeader
                  title={
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {template.name}
                    </Typography>
                  }
                  action={
                    <>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, template.id)}
                        sx={{ color: "#868ca0" }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchors[template.id]}
                        open={Boolean(menuAnchors[template.id])}
                        onClose={() => handleMenuClose(template.id)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                      >
                        <MenuItem onClick={() => handleEditTemplate(template.id)}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleDeleteTemplate(template.id)}>
                          <DeleteIcon fontSize="small" sx={{ mr: 1, color: "#f44336" }} /> Delete
                        </MenuItem>
                      </Menu>
                    </>
                  }
                  sx={{
                    background: "#f0f2fa",
                    // borderBottom: "1px solid #e0e2ea",
                    minHeight: 60,
                    px: 2,
                  }}
                />
                <Divider sx={{ mb: 0, mt: 0 }} />
                <CardContent sx={{ px: 2, py: 1 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {template.description || "No description available."}
                  </Typography>
                  <Typography sx={{ mb: 0, fontWeight: "bold" }}>
                    Projects:
                  </Typography>
                  {template.projects && template.projects.length > 0 ? (
                    <List dense disablePadding>
                      {template.projects.map((project) => (
                        <ListItem key={project.id} sx={{ pl: 1 }}>
                          <ListItemText
                            primary={
                              <span>
                                <b>{project.given_by}</b> &rarr; <b>{project.taken_by}</b>
                              </span>
                            }
                            secondary={
                              <span style={{ fontSize: 11 }}>
                                {project.rate_amount} {project.currency} ({project.rate_mode})
                              </span>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No projects
                    </Typography>
                  )}
                </CardContent>
                <Box sx={{ p: 1, pt: 0, textAlign: "right" }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setSelectedTemplateId(template.id)}
                    sx={{ minWidth: 120 }}
                  >
                    View Tree
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {tabIdx === 1 && (
        <Box sx={{ height: 600, bgcolor: "#f9faff", borderRadius: 2 }}>
          {nodes.length > 0 ? (
            <ReactFlow nodes={nodes} edges={edges} fitView>
              <Background />
              <Controls />
            </ReactFlow>
          ) : (
            <Typography sx={{ p: 2 }}>Loading tree view...</Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
