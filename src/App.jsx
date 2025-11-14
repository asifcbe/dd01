import React, { useState } from "react";
import AuthCard from "./components/AuthCard.jsx"; // Make sure your AuthCard uses centering Box wrapper from earlier
import Dashboard from "./components/Dashboard.jsx";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "Jane Doe",
    avatar: "https://i.pravatar.cc/300"
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
      {!loggedIn ? (
        <AuthCard
          onLogin={() => setLoggedIn(true)}
          onSignup={() => setLoggedIn(true)}
        />
      ) : (
        <Dashboard user={user} onLogout={() => setLoggedIn(false)} />
      )}
      </div>
    </ThemeProvider>
  );
}
