import React from "react";
import ReactDOM from "react-dom/client";

import { PinoramaClientProvider } from "@/components/pinorama-client-provider";
import { ThemeProvider } from "@/components/theme-provider";
import App from "./app.tsx";
import "./globals.css";

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="pinorama-studio-theme">
      <PinoramaClientProvider options={{ url: "/pinorama" }}>
        <App />
      </PinoramaClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
