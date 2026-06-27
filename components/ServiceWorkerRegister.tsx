"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker — production only, so it never interferes
 * with Turbopack hot-reload during development.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
