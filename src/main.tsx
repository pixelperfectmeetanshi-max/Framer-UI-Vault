import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./contexts/ToastContext";
import { AppProvider } from "./contexts/AppContext";
import { ThemeColorProvider } from "./contexts/ThemeColorContext";
import { ToastContainer } from "./components/ToastContainer";
import App from "./App";
import { useToast } from "./contexts/ToastContext";
import { useApp } from "./contexts/AppContext";
import type { ComponentItem } from "./types";

// Check if we're running inside Framer
const isInsideFramer = typeof window !== 'undefined' && 
  (window.parent !== window || window.location.href.includes('framer'));

// Preview wrapper that shows toast messages without Framer integration
function PreviewApp() {
  const { showToast } = useToast();
  const { addToRecentlyUsed } = useApp();

  const handleInsert = async (item: ComponentItem) => {
    // In preview mode, just show a toast message
    showToast(`Preview: "${item.name}" would be inserted into Framer canvas`, "success");
    addToRecentlyUsed(item);
  };

  return <App onInsert={handleInsert} />;
}

// Main app with Framer integration (loaded dynamically)
async function renderApp() {
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  
  if (isInsideFramer) {
    try {
      // Only load framer-plugin when inside Framer
      const { framer } = await import("framer-plugin");
      const { AppWithToast } = await import("./components/AppWithToast");
      
      framer.showUI({
        position: "center",
        width: 800,
        height: 600,
      });
      
      root.render(
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
    } catch (e) {
      console.error('Failed to load Framer plugin:', e);
      // Fallback to preview mode
      renderPreviewMode(root);
    }
  } else {
    // Preview mode - no Framer integration
    renderPreviewMode(root);
  }
}

function renderPreviewMode(root: ReactDOM.Root) {
  console.log('Running in preview mode (outside Framer)');
  root.render(
    <React.StrictMode>
      <AppProvider>
        <ThemeColorProvider>
          <ToastProvider>
            <ErrorBoundary level="app">
              <PreviewApp />
            </ErrorBoundary>
            <ToastContainer />
          </ToastProvider>
        </ThemeColorProvider>
      </AppProvider>
    </React.StrictMode>
  );
}

// Start the app
renderApp();
