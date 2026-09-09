import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      window.requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView());
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    window.requestAnimationFrame(() => document.getElementById("main-content")?.focus({ preventScroll: true }));
  }, [hash, pathname]);
  return null;
}
