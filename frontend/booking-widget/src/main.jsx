import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { appRouter } from "./App.jsx";
import { RouterProvider } from "react-router";
import "react-day-picker/dist/style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={appRouter} />
  </StrictMode>,
);
