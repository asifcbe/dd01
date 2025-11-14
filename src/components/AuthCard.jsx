import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Avatar
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function AuthCard({ onLogin, onSignup }) {
  const [tab, setTab] = useState("signin");

  const handleChange = (event, newVal) => setTab(newVal);

  const handleSignIn = (e) => {
    e.preventDefault();
    onLogin();
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    onSignup();
  };

  return (
    <Box
      sx={{
        height: "100vh",           // Full viewport height
        display: "flex",           // Use flexbox
        justifyContent: "center",  // Center horizontally
        alignItems: "center",      // Center vertically
        bgcolor: "background.default" // Optional background color
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          p: 4,
          boxShadow: 4,
          borderRadius: 3,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h6" sx={{ fontWeight: "bold" }}>
          Welcome Back!
        </Typography>

        <Tabs
          value={tab}
          onChange={handleChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 3,
            "& .MuiTab-root": {
              fontWeight: "bold",
              fontSize: 12,
              color: "text.primary"
            },
            "& .Mui-selected": { color: "primary.main" }
          }}
        >
          <Tab label="Sign In" value="signin" />
          <Tab label="Sign Up" value="signup" />
        </Tabs>

        {tab === "signin" ? (
          <Box component="form" noValidate onSubmit={handleSignIn} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              size="small"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              size="small"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: "bold" }}
            >
              Sign In
            </Button>
          </Box>
        ) : (
          <Box component="form" noValidate onSubmit={handleSignUp} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              size="small"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              size="small"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              size="small"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              size="small"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: "bold" }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
