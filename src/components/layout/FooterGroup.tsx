"use client";
import { useSyncExternalStore, type ReactNode } from "react";
const query = "(min-width: 768px)";
function subscribe(callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
export function FooterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  );
  return (
    <details className="footer-group" open={desktop}>
      <summary
        onClick={(e) => {
          if (desktop) e.preventDefault();
        }}
      >
        {title}
        <span aria-hidden="true">+</span>
      </summary>
      {children}
    </details>
  );
}
