import React from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Divider,
  Container,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Groups as ClientsIcon,
  Business as CompaniesIcon,
  Store as VendorsIcon,
  Engineering as ConsultantsIcon,
  Assignment as ProjectsIcon,
  DesignServices as TemplatesIcon,
  ReceiptLong as InvoicesIcon,
} from "@mui/icons-material";
import Invoices from "./Invoices";
import CustomIcon from "./CustomIcon";

const drawerWidthExpanded = 240;
const drawerWidthCollapsed = 60;

export default function Dashboard({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(true); // new state for desktop drawer collapsed
  const [selectedKey, setSelectedKey] = React.useState(dashboardItems[0].key);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleDrawerOpenToggle = () => setDrawerOpen(!drawerOpen);
  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const drawerWidth = drawerOpen ? drawerWidthExpanded : drawerWidthCollapsed;

  const drawer = (
    <>
      <Toolbar
        sx={{
          justifyContent: drawerOpen ? "space-between" : "center",
          px: 2,
        }}
      >
        {drawerOpen && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CustomIcon/>
            <Typography
              sx={{ color: "primary.main", ml: 1, fontWeight: "bold" ,fontSize:"16px"}}
            >
              Invoice Generator
            </Typography>
          </Box>
        )}
        <IconButton onClick={handleDrawerOpenToggle} size="small">
          {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {dashboardItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              selected={selectedKey === item.key}
              onClick={() => {
                setSelectedKey(item.key);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "& .MuiListItemIcon-root": {
                    color: "white",
                  },
                  "&:hover": {
                    backgroundColor: "primary.main",
                  },
                },
                justifyContent: drawerOpen ? "initial" : "center",
                px: drawerOpen ? 2 : 1.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: drawerOpen ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {drawerOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  const selectedItem = dashboardItems.find((item) => item.key === selectedKey);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: "white",
          color: "primary.main",
        }}
        elevation={1}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="primary"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, color: "primary.main" }}>
            {selectedItem?.label}
          </Typography>

          <Box display="flex" alignItems="center">
            <Avatar
              src={user.avatar}
              sx={{ width: 36, height: 36, cursor: "pointer" }}
              alt={user.name}
              onClick={handleAvatarClick}
            />
            <Typography sx={{ ml: 1, fontWeight: 500, color: "primary.main" }}>
              {user.name}
            </Typography>
          </Box>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                onLogout();
                handleMenuClose();
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar nav */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="sidebar"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidthExpanded,
              bgcolor: "white",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "white",
              transition: "width 0.3s",
              overflowX: "hidden",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
  component="main"
  sx={{
    flexGrow: 1,
    width: { sm: `calc(100% - ${drawerWidth}px)` },
    mt: 10,
    height: "calc(100vh - 64px - 56px)", // full viewport minus AppBar(64px) and Footer(56px approx)
    transition: "width 0.3s",
    display: "flex",
    flexDirection: "column",
  }}
>
  <Container
    maxWidth={false}
    sx={{
      bgcolor: "white",
      borderRadius: 1,
      boxShadow: 1,
      flexGrow: 1,
      p: 0,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Box
      sx={{
        flexGrow: 1,
        overflowY: "auto", // scrolling if content is tall
        width: "100%",
        p: 0 // padding inside content area, you can adjust or remove
      }}
    >
      {selectedItem?.component}
    </Box>
  </Container>

  {/* Footer */}
  <Box
  component="footer"
  sx={{
    textAlign: "center",
    mt: "auto",
    color: "grey.600",
    letterSpacing: 1,
    fontSize: 10,            // reduced vertical padding
  }}
>
  <Divider sx={{ mb: 1 }} />© {new Date().getFullYear()} Invoice Generator
</Box>
</Box>
    </Box>
  );
}

const dashboardItems = [
  {
    key: "clients",
    label: "Clients",
    icon: <ClientsIcon />,
    component: <div>Clients content</div>,
  },
  {
    key: "companies",
    label: "Companies",
    icon: <CompaniesIcon />,
    component: <div>Companies content</div>,
  },
  {
    key: "vendors",
    label: "Vendors",
    icon: <VendorsIcon />,
    component: <div>Vendors content</div>,
  },
  {
    key: "consultants",
    label: "Consultants",
    icon: <ConsultantsIcon />,
    component: <div>Consultants content</div>,
  },
  {
    key: "projects",
    label: "Projects",
    icon: <ProjectsIcon />,
    component: <div>Projects content</div>,
  },
  {
    key: "templates",
    label: "Templates",
    icon: <TemplatesIcon />,
    component: <div>Templates content</div>,
  },
  {
    key: "invoices",
    label: "Invoices",
    icon: <InvoicesIcon />,
    component: <Invoices/>,
  },
];
