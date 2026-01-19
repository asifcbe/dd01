import React, { lazy, Suspense } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  IconButton,
  Divider,
  Container,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Groups as ClientsIcon,
  Code as DeveloperIcon,
  Business as CompaniesIcon,
  Store as VendorsIcon,
  Engineering as ConsultantsIcon,
  Assignment as ProjectsIcon,
  DesignServices as TemplatesIcon,
  ReceiptLong as InvoicesIcon,
} from "@mui/icons-material";
import CustomIcon from "./CustomIcon";
import { NavLink, Routes, Route, useLocation, Navigate } from "react-router-dom";
import LoadMask from "./LoadMask";

const Clients = lazy(() => import("./Clients"));
const Developer = lazy(() => import("./Developer"));
const Companies = lazy(() => import("./Companies"));
const Vendors = lazy(() => import("./Vendors"));
const Consultants = lazy(() => import("./Consultants"));
const Projects = lazy(() => import("./Projects"));
const Templates = lazy(() => import("./Templates"));
const Invoices = lazy(() => import("./Invoice"));

const drawerWidthExpanded = 240;
const drawerWidthCollapsed = 60;

const dashboardItems = [
  { key: "clients", label: "Clients", icon: <ClientsIcon />, path: "clients" },
  { key: "developer", label: "Developer", icon: <DeveloperIcon />, path: "developer" },
  { key: "companies", label: "Companies", icon: <CompaniesIcon />, path: "companies" },
  { key: "vendors", label: "Vendors", icon: <VendorsIcon />, path: "vendors" },
  { key: "consultants", label: "Consultants", icon: <ConsultantsIcon />, path: "consultants" },
  { key: "projects", label: "Projects", icon: <ProjectsIcon />, path: "projects" },
  { key: "templates", label: "Templates", icon: <TemplatesIcon />, path: "templates" },
  { key: "invoices", label: "Invoices", icon: <InvoicesIcon />, path: "invoices" },
];

export default function DashboardLayout({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const currentKey = pathParts[0] || "";
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleDrawerOpenToggle = () => setDrawerOpen(!drawerOpen);
  const drawerWidth = drawerOpen ? drawerWidthExpanded : drawerWidthCollapsed;

  const drawer = (
    <>
      <Toolbar sx={{ justifyContent: drawerOpen ? "space-between" : "center", px: 2 }}>
        {drawerOpen && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CustomIcon />
            <Typography sx={{ color: "primary.main", ml: 1, fontWeight: "bold", fontSize: "16px" }}>Invoice Generator</Typography>
          </Box>
        )}
        <IconButton onClick={handleDrawerOpenToggle} size="small">{drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}</IconButton>
      </Toolbar>
      <Divider />
      <List>
        {dashboardItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton component={NavLink} to={`/${item.path}`} selected={currentKey === item.key} onClick={() => { if (isMobile) setMobileOpen(false); }} sx={{ "&.Mui-selected": { backgroundColor: "primary.main", color: "white", "& .MuiListItemIcon-root": { color: "white" }, "&:hover": { backgroundColor: "primary.main" } }, justifyContent: drawerOpen ? "initial" : "center", px: drawerOpen ? 2 : 1.5 }}>
              <ListItemIcon sx={{ minWidth: 0, mr: drawerOpen ? 3 : "auto", justifyContent: "center" }}>{item.icon}</ListItemIcon>
              {drawerOpen && <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />

      {/* AppBar */}
      <Box sx={{ position: "fixed", top: 0, width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, bgcolor: "white", color: "primary.main", borderBottom: "1px solid #e0e0e0", zIndex: 1200, px: 2 }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="primary" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: "none" } }} aria-label="menu">
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, color: "primary.main" }}></Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar src={user.avatar} sx={{ width: 36, height: 36 }} alt={user.email} />
            <Box>
              <Typography sx={{ fontWeight: 500, color: "primary.main", fontSize: "0.9rem" }}>{user.email}</Typography>
              <Typography sx={{ fontWeight: 400, color: "grey.600", fontSize: "0.8rem" }}>{user.org}</Typography>
            </Box>
            <IconButton onClick={onLogout} color="primary" aria-label="logout"><LogoutIcon /></IconButton>
          </Box>
        </Toolbar>
      </Box>

      {/* Sidebar nav */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="sidebar">
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidthExpanded, bgcolor: "white" } }}>{drawer}</Drawer>
        <Drawer variant="permanent" open sx={{ display: { xs: "none", sm: "block" }, width: drawerWidth, flexShrink: 0, "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", bgcolor: "white", transition: "width 0.3s", overflowX: "hidden" } }}>{drawer}</Drawer>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 10, height: "calc(100vh - 64px - 56px)", transition: "width 0.3s", display: "flex", flexDirection: "column" }}>
        <Container maxWidth={false} sx={{ bgcolor: "white", borderRadius: 1, flexGrow: 1, p: 0, display: "flex", flexDirection: "column" }}>
          <Box sx={{ flexGrow: 1, overflowY: "auto", width: "100%", p: 0 }}>
            <Suspense fallback={<LoadMask text='Loading'/>}>
              <Routes>
                <Route index element={<Navigate replace to={dashboardItems[0].path} />} />
                <Route path="clients" element={<Clients />} />
                <Route path="developer" element={<Developer />} />
                <Route path="companies" element={<Companies />} />
                <Route path="vendors" element={<Vendors />} />
                <Route path="consultants" element={<Consultants />} />
                <Route path="projects" element={<Projects />} />
                <Route path="templates" element={<Templates />} />
                <Route path="invoices" element={<Invoices />} />
              </Routes>
            </Suspense>
          </Box>
        </Container>

        {/* Footer */}
        <Box component="footer" sx={{ height: "2vh", textAlign: "center", mt: "auto", color: "grey.600", letterSpacing: 1, fontSize: 10 }}>
          <Divider sx={{ mb: 1 }} />© {new Date().getFullYear()} Invoice Generator
        </Box>
      </Box>
    </Box>
  );
}
