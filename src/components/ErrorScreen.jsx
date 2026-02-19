import React, { useEffect } from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useErrorScreen } from "../context/ErrorContext";
import { errorLabels } from "./utils";
// User-friendly, non-technical labels for the error screen
const statusLabels = errorLabels;


export default function ErrorScreen() {
  const { error, dismissError } = useErrorScreen();
  const theme = useTheme();
  const { visible, status, message } = error;

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible) return null;

  const statusText = statusLabels[status] || `Error ${status}`;
  const isServerError = status >= 500;

  return (
    <>
    {statusLabels.hasOwnProperty(status) ? <Box
      className="error-screen-overlay"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        animation: "errorScreenFadeIn 0.3s ease-out",
        "@keyframes errorScreenFadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
      onClick={(e) => e.target === e.currentTarget && dismissError()}
    >
      <Box
        className="error-screen-card"
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 6,
          maxWidth: 420,
          width: "90%",
          p: 3,
          textAlign: "center",
          animation: "errorScreenSlideIn 0.35s ease-out",
          "@keyframes errorScreenSlideIn": {
            from: {
              opacity: 0,
              transform: "scale(0.92) translateY(-12px)",
            },
            to: {
              opacity: 1,
              transform: "scale(1) translateY(0)",
            },
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: isServerError ? "error.light" : "warning.light",
            color: isServerError ? "error.main" : "warning.dark",
            mb: 2,
            animation: "errorIconPulse 0.5s ease-out 0.2s both",
            "@keyframes errorIconPulse": {
              from: { transform: "scale(0.8)", opacity: 0 },
              to: { transform: "scale(1)", opacity: 1 },
            },
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
          {statusText}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ whiteSpace: "pre-wrap", mb: 2.5 }}
        >
          {message}
        </Typography>
        <Button
          variant="contained"
          onClick={dismissError}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1.25,
            borderRadius: 2,
          }}
        >
          Dismiss
        </Button>
      </Box>
    </Box> : <></>}
    </>
    
  );
}
