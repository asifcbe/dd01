import React, { useState } from "react";
import { Box, Tabs, Tab, Typography, Card, CardContent, CardHeader, Grid } from "@mui/material";
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

// Sample template data
const templateList = [
  { id: 1, name: "Simple Template", desc: "Basic fields for invoice" },
  { id: 2, name: "Detailed Template", desc: "Full details with items" },
  { id: 3, name: "Minimal Template", desc: "Short/compact invoice data" }
];

// Tree sample matching your flow diagram
const nodes = [
  { id: "1", position: { x: 300, y: 20 }, data: { label: "1:Yahoo Finance" }, style: { border: '2px solid #b0b6e3', borderRadius: 10 }},
  { id: "2", position: { x: 100, y: 120 }, data: { label: "2:Reed Ireland" }, style: { border: '2px solid #b0b6e3', borderRadius: 10 }},
  { id: "3", position: { x: 500, y: 120 }, data: { label: "3:Reed France" }, style: { border: '2px solid #b0b6e3', borderRadius: 10 }},
  { id: "4", position: { x: 100, y: 240 }, data: { label: "4:Sreerama Tech" }, style: { border: '2px solid #b0b6e3', borderRadius: 10 }},
  { id: "8", position: { x: 500, y: 240 }, data: { label: "8:Macron" }, style: { border: '2px solid #b0b6e3', borderRadius: 10 }},
  { id: "5", position: { x: 20,  y: 360 }, data: { label: "5:Sivarama Tech" }, style: { border: '2px solid #b0b6e3', borderRadius: 10 }},
  { id: "7", position: { x: 200, y: 360 }, data: { label: "7:Palanisamy" }, style: { border: '2px solid #b0b6e3', borderRadius: 10 }},
  { id: "6", position: { x: -60, y: 480 }, data: { label: "6:Dinesh" }, style: { border: '2px solid #b0b6e3', borderRadius: 10 }}
];

// Parent/child edges
const edges = [
  { id: "e1-2", source: "1", target: "2", label: "ProjectId:1", type: 'smoothstep' },
  { id: "e1-3", source: "1", target: "3", label: "ProjectId:2", type: 'smoothstep' },
  { id: "e2-4", source: "2", target: "4", label: "ProjectId:3", type: 'smoothstep' },
  { id: "e3-8", source: "3", target: "8", label: "ProjectId:7", type: 'smoothstep' },
  { id: "e4-5", source: "4", target: "5", label: "ProjectId:4", type: 'smoothstep' },
  { id: "e4-7", source: "4", target: "7", label: "ProjectId:6", type: 'smoothstep' },
  { id: "e5-6", source: "5", target: "6", label: "ProjectId:5", type: 'smoothstep' },
];

export default function Templates() {
  const [tabIdx, setTabIdx] = useState(0);

  return (
    <Box>
      <Tabs value={tabIdx} onChange={(_, v) => setTabIdx(v)} sx={{ mb: 2 }}>
        <Tab label="List Templates" />
        <Tab label="Tree View" />
      </Tabs>
      {tabIdx === 0 && (
        <Grid container spacing={3}>
          {templateList.map(template => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card elevation={2}>
                <CardHeader
                  title={<Typography variant="h6" fontWeight="bold">{template.name}</Typography>}
                />
                <CardContent>
                  <Typography>{template.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {tabIdx === 1 && (
        <Box sx={{ height: 600, bgcolor: "#f9faff", borderRadius: 2 }}>
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background />
            <Controls />
          </ReactFlow>
        </Box>
      )}
    </Box>
  );
}
