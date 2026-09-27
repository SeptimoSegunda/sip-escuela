"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/store/AppContext";
import { ActiveView } from "@/lib/types";

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: { id: ActiveView; label: string; icon: string }[] = [
    { id: "inicio", label: "Inicio", icon: "fa-solid fa-house" },
    { id: "catalogo", label: "Catálogo", icon: "fa-solid fa-book" },
    { id: "prestamos", label: "Préstamos", icon: "fa-solid fa-repeat" },
    { id: "socios", label: "Sujetos Educativos", icon: "fa-solid fa-users" },
    { id: "danos", label: "Registro de Daños", icon: "fa-solid fa-triangle-exclamation" },
    { id: "auditoria", label: "Bitácora", icon: "fa-solid fa-clipboard-list" },
  ];

  if (!mounted) return null;

  return (
    <aside className="sidebar">
      <nav aria-label="Navegación principal">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-button ${isActive ? "active" : ""}`}
              onClick={() => setActiveView(item.id)}
              aria-current={isActive ? "page" : undefined}
            >
              <i className={item.icon} aria-hidden="true"></i> {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
