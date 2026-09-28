"use client";

import { useEffect } from "react";

// Opens the print dialog (→ "Save as PDF") once every image on the page has
// loaded, so evidence photos and signatures aren't missing from the file.
export default function PrintTrigger() {
  useEffect(() => {
    let cancelled = false;
    const pending = Array.from(document.images)
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }),
      );
    const t = setTimeout(async () => {
      await Promise.all(pending);
      if (!cancelled) window.print();
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);
  return null;
}
