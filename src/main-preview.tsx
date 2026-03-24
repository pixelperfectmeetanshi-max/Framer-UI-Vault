import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppProvider } from "./contexts/AppContext";
import { ThemeColorProvider } from "./contexts/ThemeColorContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from "./components/ToastContainer";
import { ErrorBoundary } from "./components/ErrorBoundary";

const handleInsert = async (item: any) => {
  alert(`Local Preview Mode!\n\nSimulating insertion of "${item.name}".\n(This works correctly inside Framer!)`);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <ThemeColorProvider>
        <ToastProvider>
          <ErrorBoundary level="app">
            <App onInsert={handleInsert} />
          </ErrorBoundary>
          <ToastContainer />
        </ToastProvider>
      </ThemeColorProvider>
    </AppProvider>
  </React.StrictMode>
);
