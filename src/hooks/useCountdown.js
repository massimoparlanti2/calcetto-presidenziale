import { useState, useEffect } from "react";

export function useCountdown(iso) {
  const calc = () => {
    if (!iso) return null;
    const d = new Date(iso) - Date.now();
    if (d <= 0) return null;
    const s = Math.floor(d / 1000);
    return {
      d: Math.floor(s / 86400),
      h: Math.floor((s % 86400) / 3600),
      m: Math.floor((s % 3600) / 60),
      s: s % 60,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [iso]);
  return t;
}
