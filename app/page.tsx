"use client";

import { useEffect, useMemo, useState } from "react";

const MAINTENANCE_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours
const BULLETS = [
  "Creating New Things",
  "Updating user experience",
  "Adding new features",
];

type ThemeMode = "light" | "dark";

function getTargetTime() {
  return Date.now() + MAINTENANCE_WINDOW_MS;
}

function getRemaining(target: number) {
  const diff = Math.max(target - Date.now(), 0);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { diff, hours, minutes, seconds };
}

export default function MaintenancePage() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [target] = useState(() => getTargetTime());
  const [remaining, setRemaining] = useState(() => getRemaining(target));

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining(getRemaining(target));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  const countdownLabel = useMemo(() => {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${pad(remaining.hours)}:${pad(remaining.minutes)}:${pad(
      remaining.seconds
    )}`;
  }, [remaining]);

  const progressPercent = useMemo(() => {
    const elapsed = MAINTENANCE_WINDOW_MS - remaining.diff;
    const percent = Math.min(Math.max((elapsed / MAINTENANCE_WINDOW_MS) * 100, 0), 100);
    return Number.isNaN(percent) ? 0 : percent;
  }, [remaining.diff]);

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("theme", nextTheme);
  };

  return (
    <div className="maintenance-page">
     <main className="maintenance-shell">
       

        <section className="maintenance-panel" aria-label="Maintenance live status">
         
          <div className="panel-visual">
            <div className="visual-laptop">
              <div className="laptop-screen">
                <div className="screen-line screen-line-1" />
                <div className="screen-line screen-line-2" />
                <div className="screen-line screen-line-3" />
              </div>
              <div className="laptop-base" />
              <div className="gear gear-lg" />
              <div className="gear gear-sm" />
              <div className="tool-wrench" />
              <div className="particle particle-1" />
              <div className="particle particle-2" />
              <div className="particle particle-3" />
            </div>
          </div>

        
        </section>
      </main>

     
    </div>
  );
}
