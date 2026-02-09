import React, { lazy, Suspense, useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Avatar,
  Button,
  AppBar,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Groups as ClientsIcon,
  Code as DeveloperIcon,
  Business as CompaniesIcon,
  Store as VendorsIcon,
  Engineering as ConsultantsIcon,
  Assignment as ProjectsIcon,
  DesignServices as TemplatesIcon,
  ReceiptLong as InvoicesIcon,
} from "@mui/icons-material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CustomIcon from "./CustomIcon";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import LoadMask from "./LoadMask";
import { SearchProvider, CommonSearchBar } from "../context/SearchContext";

const Clients = lazy(() => import("./Clients"));
const Developer = lazy(() => import("./Developer"));
const Companies = lazy(() => import("./Companies"));
const Vendors = lazy(() => import("./Vendors"));
const Consultants = lazy(() => import("./Consultants"));
const Projects = lazy(() => import("./Projects"));
const Templates = lazy(() => import("./Templates"));
const Invoices = lazy(() => import("./Invoice"));

const dashboardItems = [
  { key: "clients", label: "Clients", icon: <ClientsIcon />, path: "clients" },
  { key: "companies", label: "Companies", icon: <CompaniesIcon />, path: "companies" },
  { key: "banks", label: "Banks", icon: <AccountBalanceIcon />, path: "banks" },
  { key: "vendors", label: "Vendors", icon: <VendorsIcon />, path: "vendors" },
  { key: "developer", label: "Developers", icon: <DeveloperIcon />, path: "developer" }, 
  { key: "consultants", label: "Consultants", icon: <ConsultantsIcon />, path: "consultants" },
  { key: "contracts", label: "Contracts", icon: <ProjectsIcon />, path: "contracts" },
  { key: "projects", label: "Projects", icon: <ProjectsIcon />, path: "projects" },
  { key: "templates", label: "Templates", icon: <TemplatesIcon />, path: "templates" },
  { key: "invoices", label: "Invoices", icon: <InvoicesIcon />, path: "invoices" },
  // Developer item moved to end or hidden if needed, keeping it for now
];

export default function DashboardLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const currentKey = pathParts[0] || "clients"; // Default to clients
  
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  
  const [overflowAnchorEl, setOverflowAnchorEl] = useState(null);
  const overflowMenuOpen = Boolean(overflowAnchorEl);
  const [visibleItemsCount, setVisibleItemsCount] = useState(dashboardItems.length);
  const navContainerRef = useRef(null);
  
  const [counts, setCounts] = useState({
    clients: 0,
    companies: 0,
    banks:0,
    vendors: 0,
    consultants: 0,
    developer: 0,
    contracts:0,
    projects: 0,
    templates: 0,
    invoices: 0
  });

  // Find index for Tabs
  const currentTabValue = dashboardItems.findIndex(item => item.key === currentKey);
  const tabValue = currentTabValue !== -1 ? currentTabValue : false;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    handleMenuClose();
  };

  const handleOverflowMenuOpen = (event) => {
    setOverflowAnchorEl(event.currentTarget);
  };

  const handleOverflowMenuClose = () => {
    setOverflowAnchorEl(null);
  };

  // Calculate visible items based on available space
  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!navContainerRef.current) return;
      
      const containerWidth = navContainerRef.current.offsetWidth;
      const dropdownButtonWidth = 120; // Approximate width for dropdown button
      const availableWidth = containerWidth - dropdownButtonWidth - 40; // padding buffer
      
      // Approximate width per tab (adjust based on actual rendering)
      const approxTabWidth = 180; // Approximate width including icon, label, count badge
      
      const maxVisibleItems = Math.max(1, Math.floor(availableWidth / approxTabWidth));
      
      if (maxVisibleItems < dashboardItems.length) {
        setVisibleItemsCount(maxVisibleItems);
      } else {
        setVisibleItemsCount(dashboardItems.length);
      }
    };

    calculateVisibleItems();
    
    const resizeObserver = new ResizeObserver(calculateVisibleItems);
    if (navContainerRef.current) {
      resizeObserver.observe(navContainerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const visibleItems = dashboardItems.slice(0, visibleItemsCount);
  const overflowItems = dashboardItems.slice(visibleItemsCount);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const endpoints = [
          { key: 'clients', url: '/api/clients' },
          { key: 'companies', url: '/api/companies' },
          { key: 'banks', url: '/api/banks' },
          { key: 'vendors', url: '/api/vendors' },
          { key: 'consultants', url: '/api/consultants' },
          { key: 'developer', url: '/api/developers' },
          { key: 'contracts', url: '/api/contracts' },
          { key: 'projects', url: '/api/projects' },
          { key: 'templates', url: '/api/templates' },
          { key: 'invoices', url: '/api/templates' }
        ];

        const results = await Promise.all(
          endpoints.map(ep => 
            fetch(ep.url, { credentials: "include" })
              .then(res => res.json())
              .then(data => {
                const count = Array.isArray(data) ? data.length : (data && typeof data === 'object' ? Object.keys(data).length : 0);
                return { key: ep.key, count };
              })
              .catch(err => ({ key: ep.key, count: 0 }))
          )
        );

        const newCounts = {};
        results.forEach(r => newCounts[r.key] = r.count);
        
        // Sum Companies and Banks for the 'companies' pill
        newCounts.companies = (newCounts.companies || 0);
        
        
        setCounts(newCounts);
      } catch (error) {
        console.error("Error fetching counts", error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <SearchProvider currentKey={currentKey}>
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />

      {/* Top Header */}
      <AppBar 
        position="sticky" 
        color="inherit" 
        elevation={0}
        sx={{ 
          bgcolor: "background.paper", 
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: 1200 
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 1, gap: 2 }}>
          {/* Logo & Title */}
          <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Box 
              sx={{ 
                bgcolor: 'primary.main', 
                borderRadius: '8px', 
                p: 0.8, 
                display: 'flex', 
                mr: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }}
            >
              <CustomIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
                Invoice Generator
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Business Dashboard
                </Typography>
            </Box>
          </Box>

          {/* Center: Global Search Bar */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", justifyContent: "center", flex: 1, px: 2 }}>
            <CommonSearchBar />
          </Box>

          {/* Right Section: User Menu */}
          <Box display="flex" alignItems="center" gap={1}>
              <Box 
                onClick={handleMenuOpen}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  cursor: 'pointer',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '24px',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Box sx={{ bgcolor: 'action.hover', borderRadius: '50%', p: 0.5 }}>
                  <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} alt={user.email} /> 
                </Box>
                <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2, color: 'text.primary' }}>
                    {user.email}
                  </Typography>
                  <Typography sx={{ fontWeight: 400, fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1 }}>
                    {user.org}
                  </Typography>
                </Box>
              </Box>

              {/* User Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      left: 28,
                      width: 12,
                      height: 12,
                      bgcolor: 'background.menuBox',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRight: 'none',
                      borderBottom: 'none',
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleSettingsClick} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Settings</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogoutClick} sx={{ py: 1.5, color: 'error.main' }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
          </Box>
        </Toolbar>

        {/* Mobile Search Bar - below nav on small screens */}
        <Box sx={{ display: { xs: "block", sm: "none" }, px: 2, pb: 2 }}>
          <CommonSearchBar />
        </Box>

        {/* Navigation Pills */}
        <Box 
          ref={navContainerRef}
          sx={{ 
            px: 2, 
            pb: 2, 
            pt: 1, 
            bgcolor: "background.paper",
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            overflow: 'hidden'
          }}
        >
          {/* Visible Navigation Pills */}
          {visibleItems.map((item) => {
            const itemIndex = dashboardItems.indexOf(item);
            const isSelected = tabValue === itemIndex;
            
            return (
              <Button
                key={item.key}
                component={Link}
                to={`/${item.path}`}
                sx={{
                  minHeight: '48px',
                  borderRadius: '24px',
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: isSelected ? 'common.white' : 'text.secondary',
                  bgcolor: isSelected ? 'primary.main' : 'transparent',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                    color: isSelected ? 'common.white' : 'primary.main',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.icon}
                  {item.label}
                  <Chip
                    label={counts[item.key] || 0}
                    size="small"
                    sx={{
                      bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : 'action.selected',
                      color: isSelected ? 'inherit' : 'text.secondary',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      height: '24px',
                      transition: 'all 0.2s'
                    }}
                  />
                </Box>
              </Button>
            );
          })}
          
          {/* Overflow Dropdown Button */}
          {overflowItems.length > 0 && (
            <>
              <Button
                onClick={handleOverflowMenuOpen}
                sx={{
                  minHeight: '48px',
                  borderRadius: '24px',
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'text.secondary',
                  bgcolor: overflowItems.some(item => dashboardItems.indexOf(item) === tabValue) 
                    ? 'primary.main' 
                    : 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: overflowItems.some(item => dashboardItems.indexOf(item) === tabValue)
                      ? 'primary.dark'
                      : 'action.selected',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoreHorizIcon />
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    More
                  </Typography>
                  <Chip
                    label={overflowItems.length}
                    size="small"
                    sx={{
                      bgcolor: overflowItems.some(item => dashboardItems.indexOf(item) === tabValue)
                        ? 'rgba(255,255,255,0.2)'
                        : 'primary.main',
                      color: overflowItems.some(item => dashboardItems.indexOf(item) === tabValue)
                        ? 'common.white'
                        : 'common.white',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      height: '24px',
                    }}
                  />
                </Box>
              </Button>
              
              {/* Overflow Menu */}
              <Menu
                anchorEl={overflowAnchorEl}
                open={overflowMenuOpen}
                onClose={handleOverflowMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
                    mt: 1.5,
                    minWidth: 220,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {overflowItems.map((item) => {
                  const itemIndex = dashboardItems.indexOf(item);
                  const isSelected = tabValue === itemIndex;
                  
                  return (
                    <MenuItem
                      key={item.key}
                      component={Link}
                      to={`/${item.path}`}
                      onClick={handleOverflowMenuClose}
                      selected={isSelected}
                      sx={{
                        py: 1.5,
                        px: 2,
                        bgcolor: isSelected ? 'action.selected' : 'transparent',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText>
                        {item.label}
                      </ListItemText>
                      <Chip
                        label={counts[item.key] || 0}
                        size="small"
                        sx={{
                          bgcolor: 'action.selected',
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          height: '22px',
                          ml: 1
                        }}
                      />
                    </MenuItem>
                  );
                })}
              </Menu>
            </>
          )}
        </Box>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth={false} sx={{ mt: 3, mb: 4, flexGrow: 1 }}>
        <Suspense fallback={<LoadMask text='Loading'/>}>
          <Outlet /> 
          {/* We need to render the routes defined in App.jsx here, but since App.jsx defines them as children of Layout in a sense (or rather Layout renders them via passed props or Outlet), we need to check how App.jsx uses Layout.
             Currently App.jsx uses Layout as a wrapper component: <Layout ... /> inside a Route. But Layout was handling Routes internally. 
             I will adapt this to use Outlet if migrated to nested routes, OR keep the internal Routes if simpler for now. 
             Reviewing App.jsx: it renders <Layout> inside a route. And Layout contained the Routes. 
             So I will keep the internal Routes here for minimal friction.
          */}
             <Box sx={{ minHeight: '60vh' }}>
                <Routes>
                    <Route index element={<Clients />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="developer" element={<Developer />} />
                    <Route path="companies" element={<Companies isBank={false}/>} />
                    <Route path="banks" element={<Companies isBank={true} />} />
                    <Route path="vendors" element={<Vendors />} />
                    <Route path="consultants" element={<Consultants />} />
                    <Route path="contracts" element={<Projects type={'contracts'}/>} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="templates" element={<Templates />} />
                    <Route path="invoices" element={<Invoices />} />
                </Routes>
             </Box>
        </Suspense>
      </Container>
    </Box>
    </SearchProvider>
  );
}
