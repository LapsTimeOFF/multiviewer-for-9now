import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";

import "./styles/index.css";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { createHashRouter, RouterProvider } from "react-router-dom";
import GridPlayer from "./pages/GridPlayer";

const theme = createTheme({
  palette: {
    mode: "dark"
  }
});

const router = createHashRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/grid/:data",
    element: <GridPlayer />
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
