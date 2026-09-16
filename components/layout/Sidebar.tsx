"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/store/AppContext";
import { ActiveView } from "@/lib/types";

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useApp();

  const navItems: { id: ActiveView; label: string; icon: string }[] = [
    { id: "inicio", label: "Inicio", icon: "fa-solid fa-house" },
    { id: "catalogo", label: "Catálogo", icon: "fa-solid fa-book" },
    { id: "prestamos", label: "Préstamos", icon: "fa-solid fa-repeat" },
    { id: "socios", label: "Socios / Alumnos", icon: "fa-solid fa-users" },
    { id: "reportes", label: "Reportes", icon: "fa-solid fa-chart-pie" }
  ];

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

        <div style={{ margin: "1rem 0", borderTop: "1px solid var(--beige-anchor)" }}></div>

        <Link
          href="/perfil"
          className="nav-button"
          style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
        >
          <i className="fa-solid fa-id-card" aria-hidden="true"></i> Mi Ficha de Perfil
        </Link>

        <Link
          href="/hero"
          className="nav-button"
          style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
        >
          <i className="fa-solid fa-compass" aria-hidden="true"></i> Presentación
        </Link>

        <Link
          href="/tarjetas"
          className="nav-button"
          style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
        >
          <i className="fa-solid fa-layer-group" aria-hidden="true"></i> Diseños de Tarjetas
        </Link>
      </nav>
    </aside>
  );
};
