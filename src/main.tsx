import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./contexts/ToastContext";
import { AppProvider } from "./contexts/AppContext";
import { ThemeColorProvider } from "./contexts/ThemeColorContext";
import { ToastContainer } from "./components/ToastContainer";
import { AppWithToast } from "./components/AppWithToast";

// Initialize Framer plugin UI only when running inside Framer
async function initFramerPlugin() {
  try {
    const { framer } = await import("framer-plugin");
    if (framer && typeof framer.showUI === 'function') {
      framer.showUI({
        position: "center",
        width: 800,
        height: 600,
      });
    }
  } catch (e) {
    // Running outside Framer context - this is fine for preview
    console.log('Running in standalone mode (outside Framer)');
  }
}

// Initialize plugin
initFramerPlugin();

// Render the app
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <ThemeColorProvider>
        <ToastProvider>
          <ErrorBoundary level="app">
            <AppWithToast />
          </ErrorBoundary>
          <ToastContainer />
        </ToastProvider>
      </ThemeColorProvider>
    </AppProvider>
  </React.StrictMode>
);
