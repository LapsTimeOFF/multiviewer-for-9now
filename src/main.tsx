import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";

import "./styles/index.css";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Player from "./pages/Player";
import Channel from "./pages/Channel";

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
    path: "/player/:slug",
    element: <Player />
  },
  {
    path: "/channel/:slug",
    element: <Channel />
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
