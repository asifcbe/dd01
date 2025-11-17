import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import axios from "axios";
export default function AuthCard({ onLogin, onSignup }) {
  const [tab, setTab] = useState("signin");
  const [form, setForm] = useState({
    org: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event, newVal) => setTab(newVal);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const callApi = async (url, payload) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) return { ok: true, data };
      setError(data?.error || "Authentication failed");
      return { ok: false, data };
    } catch (e) {
      setError("Network error");
      return { ok: false, data: null };
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      org: form.org.trim(),
      email: form.email.trim(),
      password: form.password,
    };
    axios
      .post("/api/signin", payload, { withCredentials: true })
      .then((response) => {
        if (response.status === 200) onLogin();
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // onLogin();
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const payload = {
      org: form.org.trim(),
      email: form.email.trim(),
      password: form.password,
    };
    const result = await callApi(
      "/signup",
      payload
    );
    if (result.ok) onSignup();
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
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
          alignItems: "center",
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
              color: "text.primary",
            },
            "& .Mui-selected": { color: "primary.main" },
          }}
        >
          <Tab label="Sign In" value="signin" />
          <Tab label="Sign Up" value="signup" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
          </Alert>
        )}

        {tab === "signin" ? (
          <Box
            component="form"
            noValidate
            onSubmit={handleSignIn}
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              label="Organization"
              name="org"
              value={form.org}
              onChange={handleInputChange}
              size="small"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={form.email}
              onChange={handleInputChange}
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
              value={form.password}
              onChange={handleInputChange}
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
          <Box
            component="form"
            noValidate
            onSubmit={handleSignUp}
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              label="Organization"
              name="org"
              value={form.org}
              onChange={handleInputChange}
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
              value={form.email}
              onChange={handleInputChange}
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
              value={form.password}
              onChange={handleInputChange}
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
              value={form.confirmPassword}
              onChange={handleInputChange}
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
