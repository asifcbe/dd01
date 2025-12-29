import React, { useState, Suspense, lazy } from "react";
import AuthCard from "./components/AuthCard.jsx"; // Make sure your AuthCard uses centering Box wrapper from earlier
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
const Layout = lazy(() => import("./components/DashboardLayout.jsx"));
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import axios from "axios";
import "./App.scss";
import LoadMask from "./components/LoadMask.jsx";
const theme = createTheme();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({
    email: "",
    org: "",
    avatar: "https://i.pravatar.cc/300",
  });
  const logOut = async () => {
    try {
      const res = await axios.post(
        "/api/signout",
        {},
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        setLoggedIn(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                !loggedIn ? (
                  <AuthCard
                    onLogin={(userData) => { setUser(userData); setLoggedIn(true); }}
                    onSignup={() => setLoggedIn(true)}
                  />
                ) : (
                  <Navigate replace to="/clients" />
                )
              }
            />
            <Route
              path="/*"
              element={
                loggedIn ? (
                  <Suspense fallback={<LoadMask text="Loading Dashboard" />}>
                    <Layout user={user} onLogout={logOut} />
                  </Suspense>
                ) : (
                  <Navigate replace to="/" />
                )
              }
            />
            {/* Fallback route */}
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}
